# ===================================================================
# Pupil Labs NEON Gaze Data Quality Assessment Script
# FIXED VERSION - All Critical and Major Issues Addressed
# ===================================================================

# 作成日: 20241117
# 最終更新日: 20251117
# Fixed Version: 20251117 v1.1.0

#' @title Pupil Labs NEON Gaze Data Quality Assessment
#' @description Comprehensive analysis pipeline for assessing gaze data quality
#'   from Pupil Labs NEON eye trackers. Compares traditional (blink exclusion)
#'   vs enhanced (physiological validation) methods.
#'
#' @section Required Data Files:
#' - gaze.csv (required)
#' - 3d_eye_states.csv (optional)
#' - blinks.csv (optional)
#'
#' @section Main Functions:
#' - \code{run_quality_analysis()}: Single subject analysis
#' - \code{run_batch_analysis()}: Multiple subject analysis
#'
#' @examples
#' \dontrun{
#'   # Single subject
#'   results <- run_quality_analysis("/data/eyetracking", "P001")
#'
#'   # Batch processing
#'   batch <- run_batch_analysis("/data/eyetracking")
#' }
#'
#' @version 1.1.0
#' @date 2025-11-17
NULL

# 必要なパッケージの読み込み
library(dplyr)
library(readr)
library(ggplot2)
library(lubridate)

# gridExtraは複数プロット表示用（オプション）
if (!requireNamespace("gridExtra", quietly = TRUE)) {
  warning(
    "Package 'gridExtra' not installed. ",
    "Combined plots will not be generated. ",
    "Install with: install.packages('gridExtra')"
  )
} else {
  library(gridExtra)
}

# ===================================================================
# 0. Validation and Helper Functions
# ===================================================================

validate_gaze_columns <- function(gaze_data) {
  #' Validate that gaze data contains all required columns
  #'
  #' @param gaze_data Gaze data frame
  #' @return TRUE if valid, stops with error if invalid

  required_cols <- c(
    "timestamp [s]", "blink id", "gaze x [px]", "gaze y [px]",
    "pupil diameter left [mm]", "pupil diameter right [mm]",
    "fixation id", "saccade id"
  )

  missing_cols <- setdiff(required_cols, names(gaze_data))

  if (length(missing_cols) > 0) {
    stop(sprintf(
      "Missing required columns: %s\n\nAvailable columns: %s\n\nPlease check that you are using the correct gaze.csv file from Pupil Labs NEON.",
      paste(missing_cols, collapse = ", "),
      paste(names(gaze_data), collapse = ", ")
    ))
  }

  return(TRUE)
}


validate_data_sanity <- function(gaze_data) {
  #' Perform sanity checks on gaze data
  #'
  #' @param gaze_data Gaze data frame
  #' @return TRUE if all checks pass, warns if issues found

  issues <- list()

  # Check timestamp order
  timestamps <- as.numeric(gaze_data$`timestamp [s]`)
  if (any(diff(timestamps) < 0, na.rm = TRUE)) {
    issues <- c(issues, "Timestamps are not monotonically increasing")
  }

  # Check for duplicate timestamps
  if (anyDuplicated(timestamps)) {
    issues <- c(issues, "Duplicate timestamps detected")
  }

  # Check pupil diameter ranges (physiological range: 2-8mm typically)
  left_pupil <- gaze_data$`pupil diameter left [mm]`
  right_pupil <- gaze_data$`pupil diameter right [mm]`

  if (any(!is.na(left_pupil) & (left_pupil < 0 | left_pupil > 10))) {
    issues <- c(issues, "Left pupil diameter values outside physiological range (0-10mm)")
  }

  if (any(!is.na(right_pupil) & (right_pupil < 0 | right_pupil > 10))) {
    issues <- c(issues, "Right pupil diameter values outside physiological range (0-10mm)")
  }

  # Check gaze coordinates
  if (any(!is.na(gaze_data$`gaze x [px]`) & gaze_data$`gaze x [px]` < 0)) {
    issues <- c(issues, "Negative gaze x coordinates detected")
  }

  if (any(!is.na(gaze_data$`gaze y [px]`) & gaze_data$`gaze y [px]` < 0)) {
    issues <- c(issues, "Negative gaze y coordinates detected")
  }

  # Report issues
  if (length(issues) > 0) {
    warning("Data sanity check found issues:\n  ",
            paste(issues, collapse = "\n  "),
            "\n\nProceeding with analysis, but please verify data quality.")
  } else {
    cat("Data sanity checks passed.\n")
  }

  return(length(issues) == 0)
}


validate_params <- function(pupil_diameter_threshold, min_valid_ratio) {
  #' Validate function parameters
  #'
  #' @param pupil_diameter_threshold Pupil diameter threshold in mm
  #' @param min_valid_ratio Minimum valid ratio (0-1)
  #' @return TRUE if valid, stops with error if invalid

  if (!is.numeric(pupil_diameter_threshold) || pupil_diameter_threshold < 0) {
    stop("pupil_diameter_threshold must be a positive number (typically 0.5-2.0 mm)")
  }

  if (!is.numeric(min_valid_ratio) || min_valid_ratio < 0 || min_valid_ratio > 1) {
    stop("min_valid_ratio must be between 0 and 1")
  }

  return(TRUE)
}


# ===================================================================
# 1. データ読み込み関数
# ===================================================================

load_gaze_data <- function(base_dir, subject_id) {
  #' Pupil Labs NEONのgaze.csvファイルを読み込む
  #'
  #' @param base_dir データが保存されているベースディレクトリ
  #' @param subject_id 被験者ID
  #' @return 視線データのdata.frame

  gaze_file <- file.path(base_dir, subject_id, "gaze.csv")

  if (!file.exists(gaze_file)) {
    stop(sprintf(
      "Gaze file not found: %s\n\nPlease check:\n  1. Subject ID '%s' is correct\n  2. Base directory '%s' is correct\n  3. File has not been moved/deleted",
      gaze_file, subject_id, base_dir
    ))
  }

  cat(sprintf("Loading gaze data from: %s\n", gaze_file))

  # Read data
  gaze_data <- read_csv(gaze_file, show_col_types = FALSE)

  # Validate columns
  validate_gaze_columns(gaze_data)

  # Convert timestamp to numeric and add normalized time
  gaze_data <- gaze_data %>%
    mutate(
      `timestamp [s]` = as.numeric(`timestamp [s]`),
      time_sec = `timestamp [s]` - min(`timestamp [s]`, na.rm = TRUE)
    )

  cat(sprintf("Loaded %d gaze samples\n", nrow(gaze_data)))

  # Perform sanity checks
  validate_data_sanity(gaze_data)

  return(gaze_data)
}


load_eye_states <- function(base_dir, subject_id) {
  #' 3d_eye_states.csvファイルを読み込む（オプション）
  #'
  #' @param base_dir データが保存されているベースディレクトリ
  #' @param subject_id 被験者ID
  #' @return 眼球状態データ（ファイルがない場合はNULL）

  eye_states_file <- file.path(base_dir, subject_id, "3d_eye_states.csv")

  if (!file.exists(eye_states_file)) {
    cat("3d_eye_states.csv not found. Skipping.\n")
    return(NULL)
  }

  cat(sprintf("Loading eye states data from: %s\n", eye_states_file))

  eye_states <- read_csv(eye_states_file, show_col_types = FALSE)

  cat(sprintf("Loaded %d eye state samples\n", nrow(eye_states)))

  return(eye_states)
}


load_blinks <- function(base_dir, subject_id) {
  #' blinks.csvファイルを読み込む（オプション）
  #'
  #' @param base_dir データが保存されているベースディレクトリ
  #' @param subject_id 被験者ID
  #' @return 瞬き検出データ（ファイルがない場合はNULL）

  blinks_file <- file.path(base_dir, subject_id, "blinks.csv")

  if (!file.exists(blinks_file)) {
    cat("blinks.csv not found. Will use blink id from gaze.csv\n")
    return(NULL)
  }

  cat(sprintf("Loading blinks data from: %s\n", blinks_file))

  blinks <- read_csv(blinks_file, show_col_types = FALSE)

  cat(sprintf("Loaded %d blink events\n", nrow(blinks)))

  return(blinks)
}


# ===================================================================
# 2. データ品質評価関数（従来法）
# ===================================================================

assess_traditional_quality <- function(gaze_data) {
  #' 従来の方法でデータ品質を評価
  #' 瞬き期間全体を除外する方法
  #'
  #' @param gaze_data 視線データ
  #' @return list containing:
  #'   - usable_data: 使用可能なデータのdata.frame
  #'   - excluded_data: 除外されたデータのdata.frame
  #'   - stats: 統計情報

  cat("\n=== Traditional Quality Assessment ===\n")

  total_samples <- nrow(gaze_data)

  # FIXED: Include NA blink ids as valid (non-blink) data
  usable_data <- gaze_data %>%
    filter(`blink id` == 0 | is.na(`blink id`))

  excluded_data <- gaze_data %>%
    filter(!is.na(`blink id`) & `blink id` > 0)

  usable_samples <- nrow(usable_data)
  excluded_samples <- nrow(excluded_data)

  # FIXED: Handle case where no samples exist
  usability_rate <- if (total_samples > 0) {
    usable_samples / total_samples
  } else {
    0
  }

  stats <- list(
    total_samples = total_samples,
    usable_samples = usable_samples,
    excluded_samples = excluded_samples,
    usability_rate = usability_rate
  )

  cat(sprintf("Total samples: %d\n", total_samples))
  cat(sprintf("Usable samples: %d (%.1f%%)\n",
              usable_samples, usability_rate * 100))
  cat(sprintf("Excluded samples: %d (%.1f%%)\n",
              excluded_samples, (1 - usability_rate) * 100))

  return(list(
    usable_data = usable_data,
    excluded_data = excluded_data,
    stats = stats
  ))
}


# ===================================================================
# 3. データ品質評価関数（改良法）
# ===================================================================

assess_enhanced_quality <- function(gaze_data,
                                   pupil_diameter_threshold = 0.5,
                                   min_valid_ratio = 0.6) {
  #' 改良された方法でデータ品質を評価
  #' 瞬き期間内でも生理学的に妥当なデータを利用
  #'
  #' @param gaze_data 視線データ
  #' @param pupil_diameter_threshold 瞳孔径の最小閾値（mm）
  #' @param min_valid_ratio 有効と判断する最小比率
  #' @return list containing:
  #'   - enhanced_data: Full dataset with quality metrics
  #'   - usable_data: Filtered dataset meeting quality thresholds
  #'   - stats: List of statistics including total_samples, usable_samples,
  #'     usability_rate, blink_samples, usable_blink_samples, recovered_rate

  cat("\n=== Enhanced Quality Assessment ===\n")

  # Validate parameters
  validate_params(pupil_diameter_threshold, min_valid_ratio)

  total_samples <- nrow(gaze_data)

  # サンプルごとの品質評価
  gaze_enhanced <- gaze_data %>%
    mutate(
      # 瞳孔径による判定
      pupil_left_valid = !is.na(`pupil diameter left [mm]`) &
                         `pupil diameter left [mm]` > pupil_diameter_threshold,
      pupil_right_valid = !is.na(`pupil diameter right [mm]`) &
                          `pupil diameter right [mm]` > pupil_diameter_threshold,

      # 視線位置の有効性
      gaze_valid = !is.na(`gaze x [px]`) & !is.na(`gaze y [px]`),

      # 総合的な品質判定
      quality_score = (as.numeric(pupil_left_valid) +
                       as.numeric(pupil_right_valid) +
                       as.numeric(gaze_valid)) / 3,

      # 最終判定
      is_usable = quality_score >= min_valid_ratio
    )

  # 瞬き期間の分析 (FIXED: handle NA blink ids)
  in_blink <- gaze_enhanced %>%
    filter(!is.na(`blink id`) & `blink id` > 0)
  usable_in_blink <- in_blink %>% filter(is_usable)

  # 統計情報
  usable_samples <- sum(gaze_enhanced$is_usable, na.rm = TRUE)
  usability_rate <- if (total_samples > 0) {
    usable_samples / total_samples
  } else {
    0
  }

  blink_samples <- nrow(in_blink)
  usable_blink_samples <- nrow(usable_in_blink)
  recovered_rate <- if(blink_samples > 0) {
    usable_blink_samples / blink_samples
  } else {
    0
  }

  stats <- list(
    total_samples = total_samples,
    usable_samples = usable_samples,
    usability_rate = usability_rate,
    blink_samples = blink_samples,
    usable_blink_samples = usable_blink_samples,
    recovered_rate = recovered_rate
  )

  cat(sprintf("Total samples: %d\n", total_samples))
  cat(sprintf("Usable samples: %d (%.1f%%)\n",
              usable_samples, usability_rate * 100))
  cat(sprintf("\nBlink period analysis:\n"))
  cat(sprintf("  Samples in blink periods: %d\n", blink_samples))
  cat(sprintf("  Usable samples in blink periods: %d (%.1f%%)\n",
              usable_blink_samples, recovered_rate * 100))

  return(list(
    enhanced_data = gaze_enhanced,
    usable_data = gaze_enhanced %>% filter(is_usable),
    stats = stats
  ))
}


# ===================================================================
# 4. 瞬き分析関数
# ===================================================================

analyze_blinks <- function(gaze_data, blinks_data = NULL) {
  #' 瞬きパターンを分析
  #'
  #' @param gaze_data 視線データ
  #' @param blinks_data 瞬きデータ（オプション、NULL可）
  #' @return 瞬き分析結果のlist containing stats, blink_rate, and blink_data

  cat("\n=== Blink Analysis ===\n")

  if (!is.null(blinks_data)) {
    # blinks.csvがある場合
    blink_stats <- blinks_data %>%
      summarise(
        total_blinks = n(),
        mean_duration = mean(`duration [ms]`, na.rm = TRUE),
        sd_duration = sd(`duration [ms]`, na.rm = TRUE),
        median_duration = median(`duration [ms]`, na.rm = TRUE),
        min_duration = min(`duration [ms]`, na.rm = TRUE),
        max_duration = max(`duration [ms]`, na.rm = TRUE)
      )

    blink_data_for_plot <- blinks_data

  } else {
    # gaze.csvのblink idから推定 (FIXED: handle NA blink ids)
    blink_periods <- gaze_data %>%
      filter(!is.na(`blink id`) & `blink id` > 0) %>%
      group_by(`blink id`) %>%
      summarise(
        start_time = min(`timestamp [s]`, na.rm = TRUE),
        end_time = max(`timestamp [s]`, na.rm = TRUE),
        duration_ms = (end_time - start_time) * 1000,
        n_samples = n(),
        .groups = 'drop'
      )

    if (nrow(blink_periods) > 0) {
      blink_stats <- blink_periods %>%
        summarise(
          total_blinks = n(),
          mean_duration = mean(duration_ms, na.rm = TRUE),
          sd_duration = sd(duration_ms, na.rm = TRUE),
          median_duration = median(duration_ms, na.rm = TRUE),
          min_duration = min(duration_ms, na.rm = TRUE),
          max_duration = max(duration_ms, na.rm = TRUE)
        )

      # プロット用データ
      blink_data_for_plot <- blink_periods %>%
        rename(`duration [ms]` = duration_ms)
    } else {
      # No blinks detected
      blink_stats <- data.frame(
        total_blinks = 0,
        mean_duration = NA,
        sd_duration = NA,
        median_duration = NA,
        min_duration = NA,
        max_duration = NA
      )
      blink_data_for_plot <- data.frame(`duration [ms]` = numeric(0), check.names = FALSE)
    }
  }

  # 結果表示
  cat(sprintf("Total blinks detected: %d\n", blink_stats$total_blinks))

  if (blink_stats$total_blinks > 0) {
    cat(sprintf("Mean duration: %.1f ms (SD: %.1f ms)\n",
                blink_stats$mean_duration, blink_stats$sd_duration))
    cat(sprintf("Median duration: %.1f ms\n", blink_stats$median_duration))
    cat(sprintf("Range: %.1f - %.1f ms\n",
                blink_stats$min_duration, blink_stats$max_duration))

    # FIXED:録画時間から瞬き頻度を計算 (division by zero protection)
    recording_duration <- max(gaze_data$`timestamp [s]`, na.rm = TRUE) -
                         min(gaze_data$`timestamp [s]`, na.rm = TRUE)

    if (recording_duration > 1) {  # At least 1 second
      blink_rate <- blink_stats$total_blinks / (recording_duration / 60)
      cat(sprintf("Blink rate: %.1f blinks/minute\n", blink_rate))
    } else {
      blink_rate <- NA
      cat("Blink rate: N/A (recording too short)\n")
    }
  } else {
    cat("No blink statistics available (no blinks detected)\n")
    blink_rate <- 0
  }

  return(list(
    stats = blink_stats,
    blink_rate = blink_rate,
    blink_data = blink_data_for_plot
  ))
}


# ===================================================================
# 5. 比較分析関数
# ===================================================================

compare_methods <- function(traditional_result, enhanced_result) {
  #' 従来法と改良法を比較
  #'
  #' @param traditional_result 従来法の結果
  #' @param enhanced_result 改良法の結果
  #' @return 比較統計情報

  cat("\n=== Method Comparison ===\n")

  trad_usability <- traditional_result$stats$usability_rate
  enh_usability <- enhanced_result$stats$usability_rate

  improvement <- enh_usability - trad_usability

  # FIXED: Handle division by zero
  improvement_pct <- if(trad_usability > 0) {
    (improvement / trad_usability) * 100
  } else {
    NA_real_
  }

  cat(sprintf("Traditional method: %.1f%% usable\n", trad_usability * 100))
  cat(sprintf("Enhanced method: %.1f%% usable\n", enh_usability * 100))

  if (!is.na(improvement_pct)) {
    cat(sprintf("Improvement: +%.1f percentage points (+%.1f%%)\n",
                improvement * 100, improvement_pct))
  } else {
    cat(sprintf("Improvement: +%.1f percentage points\n", improvement * 100))
  }

  comparison <- list(
    traditional_usability = trad_usability,
    enhanced_usability = enh_usability,
    absolute_improvement = improvement,
    relative_improvement = improvement_pct
  )

  return(comparison)
}


# ===================================================================
# 6. グラフ描画関数
# ===================================================================

plot_quality_timeseries <- function(gaze_data, title = "Gaze Data Quality Over Time") {
  #' データ品質の時系列プロット
  #'
  #' @param gaze_data 視線データ (must include time_sec column)
  #' @param title プロットのタイトル
  #' @return ggplotオブジェクト

  # Ensure time_sec exists (it should from load_gaze_data, but check)
  if (!"time_sec" %in% names(gaze_data)) {
    gaze_data <- gaze_data %>%
      mutate(time_sec = as.numeric(`timestamp [s]`) - min(as.numeric(`timestamp [s]`), na.rm = TRUE))
  }

  # FIXED: Handle NA blink ids for plotting
  blink_data <- gaze_data %>%
    filter(!is.na(`blink id`) & `blink id` > 0)

  p <- ggplot(gaze_data, aes(x = time_sec)) +
    # 瞬き期間を背景に表示
    {if(nrow(blink_data) > 0) {
      geom_rect(
        data = blink_data,
        aes(xmin = time_sec, xmax = time_sec + 0.01,
            ymin = -Inf, ymax = Inf),
        fill = "pink", alpha = 0.3, inherit.aes = FALSE
      )
    }} +
    # データ品質をライン表示
    geom_line(aes(y = as.numeric(`fixation id` > 0), color = "Fixation"),
              linewidth = 0.5) +
    geom_line(aes(y = as.numeric(`saccade id` > 0), color = "Saccade"),
              linewidth = 0.5) +
    scale_color_manual(
      name = "Eye Movement",
      values = c("Fixation" = "blue", "Saccade" = "red")
    ) +
    labs(
      title = title,
      x = "Time (seconds)",
      y = "Event Present (0/1)"
    ) +
    theme_minimal() +
    theme(
      legend.position = "bottom",
      plot.title = element_text(hjust = 0.5, size = 14, face = "bold")
    )

  print(p)
  return(p)
}


plot_blink_distribution <- function(blink_data) {
  #' 瞬き頻度のヒストグラム
  #'
  #' @param blink_data 瞬きデータ
  #' @return ggplotオブジェクト（データがない場合はNULL）

  if (is.null(blink_data) || nrow(blink_data) == 0) {
    message("No blink data available for plotting")
    return(NULL)
  }

  median_duration <- median(blink_data$`duration [ms]`, na.rm = TRUE)

  p <- ggplot(blink_data, aes(x = `duration [ms]`)) +
    geom_histogram(
      bins = 30,
      fill = "steelblue",
      color = "white",
      alpha = 0.7
    ) +
    geom_vline(
      xintercept = median_duration,
      color = "red",
      linetype = "dashed",
      linewidth = 1
    ) +
    annotate(
      "text",
      x = median_duration,
      y = Inf,
      label = sprintf("Median: %.1f ms", median_duration),
      hjust = -0.1,
      vjust = 2,
      color = "red"
    ) +
    labs(
      title = "Distribution of Blink Duration",
      x = "Duration (ms)",
      y = "Count"
    ) +
    theme_minimal() +
    theme(
      plot.title = element_text(hjust = 0.5, size = 14, face = "bold")
    )

  print(p)
  return(p)
}


plot_pupil_diameter <- function(gaze_data) {
  #' 瞳孔径の時系列プロット
  #'
  #' @param gaze_data 視線データ
  #' @return ggplotオブジェクト（データがない場合はNULL）

  # Ensure time_sec exists
  if (!"time_sec" %in% names(gaze_data)) {
    gaze_data <- gaze_data %>%
      mutate(time_sec = as.numeric(`timestamp [s]`) - min(as.numeric(`timestamp [s]`), na.rm = TRUE))
  }

  # FIXED: データ準備 - improved pupil averaging
  plot_data <- gaze_data %>%
    mutate(
      # FIXED: Smarter averaging that handles monocular data
      pupil_avg = case_when(
        !is.na(`pupil diameter left [mm]`) & !is.na(`pupil diameter right [mm]`) ~
          (`pupil diameter left [mm]` + `pupil diameter right [mm]`) / 2,
        !is.na(`pupil diameter left [mm]`) ~ `pupil diameter left [mm]`,
        !is.na(`pupil diameter right [mm]`) ~ `pupil diameter right [mm]`,
        TRUE ~ NA_real_
      ),
      in_blink = !is.na(`blink id`) & `blink id` > 0
    ) %>%
    filter(!is.na(pupil_avg))

  if (nrow(plot_data) == 0) {
    message("No pupil diameter data available")
    return(NULL)
  }

  # Separate blink data for background
  blink_data <- plot_data %>% filter(in_blink)

  p <- ggplot(plot_data, aes(x = time_sec, y = pupil_avg)) +
    # 瞬き期間を背景に
    {if(nrow(blink_data) > 0) {
      geom_rect(
        data = blink_data,
        aes(xmin = time_sec, xmax = time_sec + 0.01,
            ymin = -Inf, ymax = Inf),
        fill = "pink", alpha = 0.3, inherit.aes = FALSE
      )
    }} +
    # 瞳孔径のライン
    geom_line(color = "darkgreen", linewidth = 0.3, alpha = 0.6) +
    # 移動平均を追加
    geom_smooth(
      method = "loess",
      span = 0.1,
      color = "blue",
      linewidth = 1,
      se = FALSE
    ) +
    labs(
      title = "Pupil Diameter Over Time",
      x = "Time (seconds)",
      y = "Average Pupil Diameter (mm)"
    ) +
    theme_minimal() +
    theme(
      plot.title = element_text(hjust = 0.5, size = 14, face = "bold")
    )

  print(p)
  return(p)
}


plot_quality_summary <- function(quality_stats) {
  #' データ品質サマリーの棒グラフ
  #'
  #' @param quality_stats 品質統計情報
  #' @return ggplotオブジェクト

  # データフレーム形式に変換
  summary_df <- data.frame(
    Metric = c("Traditional Method", "Enhanced Method", "Improvement"),
    Percentage = c(
      quality_stats$traditional_usability * 100,
      quality_stats$enhanced_usability * 100,
      (quality_stats$enhanced_usability - quality_stats$traditional_usability) * 100
    ),
    Type = c("Traditional", "Enhanced", "Gain")
  )

  p <- ggplot(summary_df, aes(x = Metric, y = Percentage, fill = Type)) +
    geom_col(width = 0.7, alpha = 0.8) +
    geom_text(
      aes(label = sprintf("%.1f%%", Percentage)),
      vjust = -0.5,
      size = 5
    ) +
    scale_fill_manual(
      values = c("Traditional" = "grey60",
                 "Enhanced" = "steelblue",
                 "Gain" = "darkgreen")
    ) +
    labs(
      title = "Data Quality Comparison",
      x = "",
      y = "Usable Data (%)"
    ) +
    ylim(0, 105) +
    theme_minimal() +
    theme(
      plot.title = element_text(hjust = 0.5, size = 14, face = "bold"),
      legend.position = "none",
      axis.text.x = element_text(angle = 15, hjust = 1)
    )

  print(p)
  return(p)
}


plot_all_quality_metrics <- function(gaze_data, blink_data, quality_stats) {
  #' 複数プロットを一度に表示
  #'
  #' @param gaze_data 視線データ
  #' @param blink_data 瞬きデータ
  #' @param quality_stats 品質統計情報
  #' @return プロットオブジェクトのlist

  # 4つのプロットを作成
  p1 <- plot_quality_timeseries(gaze_data)
  p2 <- plot_blink_distribution(blink_data)
  p3 <- plot_pupil_diameter(gaze_data)
  p4 <- plot_quality_summary(quality_stats)

  # NULLでないプロットのみをリストに追加
  plot_list <- list(timeseries = p1, summary = p4)
  if (!is.null(p2)) plot_list$blink_hist <- p2
  if (!is.null(p3)) plot_list$pupil <- p3

  # gridExtraを使って並べて表示（NULLでないプロットのみ）
  if (requireNamespace("gridExtra", quietly = TRUE)) {
    valid_plots <- Filter(Negate(is.null), list(p1, p2, p3, p4))
    if (length(valid_plots) > 0) {
      grid.arrange(grobs = valid_plots, ncol = 2)
    }
  }

  return(plot_list)
}


# ===================================================================
# 7. レポート生成関数
# ===================================================================

generate_quality_report <- function(subject_id,
                                   gaze_data,  # FIXED: Added parameter
                                   traditional_result,
                                   enhanced_result,
                                   blink_result,
                                   comparison) {
  #' 分析結果のサマリーレポートを生成
  #'
  #' @param subject_id 被験者ID
  #' @param gaze_data 元の視線データ (FIXED: added)
  #' @param traditional_result 従来法の結果
  #' @param enhanced_result 改良法の結果
  #' @param blink_result 瞬き分析結果
  #' @param comparison 比較結果
  #' @return なし（コンソールに出力）

  cat("\n")
  cat("================================================================\n")
  cat(sprintf("Data Quality Assessment Report: %s\n", subject_id))
  cat("================================================================\n\n")

  # 1. 基本情報
  cat("1. Recording Information\n")
  cat("------------------------\n")
  total_samples <- traditional_result$stats$total_samples

  # FIXED: Use original gaze_data for more accurate calculation
  recording_duration <- max(gaze_data$`timestamp [s]`, na.rm = TRUE) -
                       min(gaze_data$`timestamp [s]`, na.rm = TRUE)

  if (recording_duration > 0) {
    sampling_rate <- total_samples / recording_duration
    cat(sprintf("Total samples: %d\n", total_samples))
    cat(sprintf("Recording duration: %.1f seconds (%.1f minutes)\n",
                recording_duration, recording_duration / 60))
    cat(sprintf("Sampling rate: %.1f Hz\n\n", sampling_rate))
  } else {
    cat(sprintf("Total samples: %d\n", total_samples))
    cat("Recording duration: N/A (invalid timestamps)\n")
    cat("Sampling rate: N/A\n\n")
  }

  # 2. 瞬き情報
  cat("2. Blink Characteristics\n")
  cat("------------------------\n")
  cat(sprintf("Total blinks: %d\n", blink_result$stats$total_blinks))

  if (!is.na(blink_result$blink_rate)) {
    cat(sprintf("Blink rate: %.1f blinks/minute\n", blink_result$blink_rate))
  } else {
    cat("Blink rate: N/A\n")
  }

  if (blink_result$stats$total_blinks > 0) {
    cat(sprintf("Mean duration: %.1f ms (SD: %.1f ms)\n",
                blink_result$stats$mean_duration,
                blink_result$stats$sd_duration))
    cat(sprintf("Median duration: %.1f ms\n\n",
                blink_result$stats$median_duration))
  } else {
    cat("No blink duration statistics available\n\n")
  }

  # 3. データ品質比較
  cat("3. Data Quality Comparison\n")
  cat("--------------------------\n")
  cat(sprintf("Traditional method: %.1f%% usable\n",
              comparison$traditional_usability * 100))
  cat(sprintf("Enhanced method: %.1f%% usable\n",
              comparison$enhanced_usability * 100))

  if (!is.na(comparison$relative_improvement)) {
    cat(sprintf("Improvement: +%.1f percentage points (+%.1f%%)\n\n",
                comparison$absolute_improvement * 100,
                comparison$relative_improvement))
  } else {
    cat(sprintf("Improvement: +%.1f percentage points\n\n",
                comparison$absolute_improvement * 100))
  }

  # 4. 瞬き期間のデータ回復
  cat("4. Data Recovery in Blink Periods\n")
  cat("----------------------------------\n")
  cat(sprintf("Samples in blink periods: %d\n",
              enhanced_result$stats$blink_samples))
  cat(sprintf("Usable samples in blink periods: %d (%.1f%%)\n",
              enhanced_result$stats$usable_blink_samples,
              enhanced_result$stats$recovered_rate * 100))

  cat("\n================================================================\n\n")
}


# ===================================================================
# 8. メイン分析パイプライン
# ===================================================================

run_quality_analysis <- function(base_dir, subject_id,
                                 save_plots = TRUE,
                                 output_dir = NULL) {
  #' 完全な品質分析パイプラインを実行
  #'
  #' @param base_dir データディレクトリ
  #' @param subject_id 被験者ID
  #' @param save_plots プロットを保存するか（論理値）
  #' @param output_dir 出力ディレクトリ（NULLの場合は被験者ディレクトリ内に作成）
  #' @return 分析結果のlist

  cat(sprintf("\n========================================\n"))
  cat(sprintf("Starting analysis for: %s\n", subject_id))
  cat(sprintf("========================================\n"))

  # 1. データ読み込み
  gaze_data <- load_gaze_data(base_dir, subject_id)
  eye_states <- load_eye_states(base_dir, subject_id)
  blinks_data <- load_blinks(base_dir, subject_id)

  # 2. 品質評価
  traditional_result <- assess_traditional_quality(gaze_data)
  enhanced_result <- assess_enhanced_quality(gaze_data)

  # 3. 瞬き分析
  blink_result <- analyze_blinks(gaze_data, blinks_data)

  # 4. 比較分析
  comparison <- compare_methods(traditional_result, enhanced_result)

  # 5. レポート生成 (FIXED: pass gaze_data)
  generate_quality_report(
    subject_id,
    gaze_data,  # FIXED: Added
    traditional_result,
    enhanced_result,
    blink_result,
    comparison
  )

  # 6. プロット生成
  if (save_plots) {
    if (is.null(output_dir)) {
      output_dir <- file.path(base_dir, subject_id, "quality_analysis")
    }
    dir.create(output_dir, showWarnings = FALSE, recursive = TRUE)

    cat(sprintf("\nSaving plots to: %s\n", output_dir))

    # 個別プロット
    p1 <- plot_quality_timeseries(gaze_data)
    ggsave(file.path(output_dir, "quality_timeseries.png"),
           p1, width = 10, height = 6, dpi = 300)

    p2 <- plot_blink_distribution(blink_result$blink_data)
    if (!is.null(p2)) {
      ggsave(file.path(output_dir, "blink_distribution.png"),
             p2, width = 8, height = 6, dpi = 300)
    }

    p3 <- plot_pupil_diameter(gaze_data)
    if (!is.null(p3)) {
      ggsave(file.path(output_dir, "pupil_diameter.png"),
             p3, width = 10, height = 6, dpi = 300)
    }

    p4 <- plot_quality_summary(comparison)
    ggsave(file.path(output_dir, "quality_summary.png"),
           p4, width = 8, height = 6, dpi = 300)

    # FIXED: 統合プロット - use arrangeGrob instead of grid.arrange
    if (requireNamespace("gridExtra", quietly = TRUE)) {
      plots <- plot_all_quality_metrics(gaze_data, blink_result$blink_data, comparison)

      # NULLでないプロットのみをリストに追加
      valid_plots <- Filter(Negate(is.null),
                           list(plots$timeseries, plots$blink_hist,
                                plots$pupil, plots$summary))

      if (length(valid_plots) > 0) {
        # Use arrangeGrob for saving
        combined_plot <- gridExtra::arrangeGrob(grobs = valid_plots, ncol = 2)
        ggsave(file.path(output_dir, "quality_overview.png"),
               combined_plot,
               width = 16, height = 12, dpi = 300)
      }
    }
  }

  # 7. 結果を返す
  results <- list(
    subject_id = subject_id,
    gaze_data = gaze_data,
    traditional_result = traditional_result,
    enhanced_result = enhanced_result,
    blink_result = blink_result,
    comparison = comparison
  )

  cat("\nAnalysis completed successfully!\n")

  return(results)
}


# ===================================================================
# 9. バッチ処理関数
# ===================================================================

run_batch_analysis <- function(base_dir,
                              subject_ids = NULL,
                              save_plots = TRUE,
                              keep_full_results = FALSE,
                              show_progress = TRUE) {
  #' 複数被験者のバッチ処理
  #'
  #' @param base_dir データディレクトリ
  #' @param subject_ids 被験者IDリスト（NULLの場合は全ディレクトリを処理）
  #' @param save_plots プロットを保存するか（論理値）
  #' @param keep_full_results 全データを保持するか（FALSE推奨、メモリ節約）
  #' @param show_progress 進捗表示（論理値）
  #' @return バッチ処理結果のlist

  # 被験者リストの取得
  if (is.null(subject_ids)) {
    subject_ids <- list.dirs(base_dir, full.names = FALSE, recursive = FALSE)
    subject_ids <- subject_ids[subject_ids != ""]
  }

  cat(sprintf("\n========================================\n"))
  cat(sprintf("Batch processing %d subjects\n", length(subject_ids)))
  cat(sprintf("========================================\n"))

  # Progress bar setup
  if (show_progress && requireNamespace("progress", quietly = TRUE)) {
    pb <- progress::progress_bar$new(
      format = "Processing [:bar] :percent eta: :eta",
      total = length(subject_ids),
      clear = FALSE
    )
  }

  # 各被験者を処理
  all_results <- list()

  for (subject_id in subject_ids) {
    if (show_progress && exists("pb")) pb$tick()

    tryCatch({
      result <- run_quality_analysis(base_dir, subject_id, save_plots)

      # FIXED: メモリ管理 - Only keep summaries unless requested
      if (!keep_full_results) {
        result$gaze_data <- NULL
        result$traditional_result$usable_data <- NULL
        result$traditional_result$excluded_data <- NULL
        result$enhanced_result$enhanced_data <- NULL
        result$enhanced_result$usable_data <- NULL
      }

      all_results[[subject_id]] <- result

      # Force garbage collection
      gc(verbose = FALSE)

    }, error = function(e) {
      cat(sprintf("\nError processing %s: %s\n", subject_id, e$message))
      all_results[[subject_id]] <- list(error = e$message)
    })
  }

  # FIXED: サマリーテーブル作成 - more efficient with bind_rows
  summary_list <- list()

  for (subject_id in names(all_results)) {
    if (!is.null(all_results[[subject_id]]) &&
        !"error" %in% names(all_results[[subject_id]])) {
      result <- all_results[[subject_id]]

      summary_list[[subject_id]] <- data.frame(
        subject_id = subject_id,
        total_samples = result$traditional_result$stats$total_samples,
        traditional_usability = result$comparison$traditional_usability,
        enhanced_usability = result$comparison$enhanced_usability,
        improvement = result$comparison$absolute_improvement,
        blink_count = result$blink_result$stats$total_blinks,
        blink_rate = ifelse(is.na(result$blink_result$blink_rate),
                           0, result$blink_result$blink_rate)
      )
    }
  }

  # Efficiently combine all summary rows
  summary_df <- bind_rows(summary_list)

  # サマリー保存
  summary_file <- file.path(base_dir, "batch_summary.csv")
  write_csv(summary_df, summary_file)

  cat("\n========================================\n")
  cat("Batch processing completed!\n")
  cat(sprintf("Summary saved to: %s\n", summary_file))
  cat("========================================\n\n")

  return(list(
    results = all_results,
    summary = summary_df
  ))
}


# ===================================================================
# 10. 使用例
# ===================================================================

# --- 単一被験者の分析 ---
# base_dir <- "/path/to/data"
# subject_id <- "P001"
# results <- run_quality_analysis(base_dir, subject_id, save_plots = TRUE)

# --- バッチ処理 ---
# batch_results <- run_batch_analysis(base_dir, save_plots = TRUE)

# --- 特定の被験者リストでバッチ処理 ---
# subject_list <- c("P001", "P002", "P003")
# batch_results <- run_batch_analysis(base_dir, subject_ids = subject_list)

# --- プロットのみ再生成 ---
# gaze_data <- load_gaze_data(base_dir, subject_id)
# blink_result <- analyze_blinks(gaze_data)
# plot_blink_distribution(blink_result$blink_data)

# --- メモリ節約モードでバッチ処理 ---
# batch_results <- run_batch_analysis(
#   base_dir,
#   save_plots = TRUE,
#   keep_full_results = FALSE  # Recommended for large datasets
# )

cat("\n")
cat("================================================================\n")
cat("Pupil Labs NEON Data Quality Assessment Script Loaded (FIXED)\n")
cat("Version: 1.1.0 (2025-11-17)\n")
cat("================================================================\n")
cat("\n使用例:\n")
cat('  results <- run_quality_analysis("/path/to/data", "P001")\n')
cat('  batch_results <- run_batch_analysis("/path/to/data")\n')
cat("\nNew features in v1.1.0:\n")
cat("  - Fixed NA handling in blink IDs\n")
cat("  - Fixed division by zero errors\n")
cat("  - Improved pupil diameter averaging\n")
cat("  - Added data validation and sanity checks\n")
cat("  - Optimized batch processing with memory management\n")
cat("  - Better error messages and handling\n")
cat("================================================================\n\n")
