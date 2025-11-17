# Pupil Labs NEON Gaze Data Quality Assessment

Comprehensive R script for analyzing eye-tracking data quality from Pupil Labs NEON devices. Compares traditional blink-exclusion methods with an enhanced physiological validation approach.

## Features

- **Dual Quality Assessment Methods:**
  - Traditional: Excludes all blink periods
  - Enhanced: Uses physiological validation to recover usable data during blinks

- **Comprehensive Analysis:**
  - Data quality metrics
  - Blink pattern analysis
  - Pupil diameter tracking
  - Automated visualization

- **Batch Processing:**
  - Process multiple subjects at once
  - Memory-efficient mode for large datasets
  - Progress tracking

## Requirements

### Required R Packages
```r
install.packages(c("dplyr", "readr", "ggplot2", "lubridate"))
```

### Optional Packages
```r
install.packages(c("gridExtra", "progress"))
```

## Input Data Format

The script expects Pupil Labs NEON data in the following structure:

```
data_directory/
├── subject_001/
│   ├── gaze.csv              # Required
│   ├── blinks.csv            # Optional
│   └── 3d_eye_states.csv     # Optional
├── subject_002/
│   ├── gaze.csv
│   └── ...
└── ...
```

### Required Columns in gaze.csv
- `timestamp [s]`
- `blink id`
- `gaze x [px]`
- `gaze y [px]`
- `pupil diameter left [mm]`
- `pupil diameter right [mm]`
- `fixation id`
- `saccade id`

## Quick Start

### 1. Load the Script
```r
source("neon_gaze_quality_assessment_fixed.R")
```

### 2. Single Subject Analysis
```r
# Define your data directory and subject ID
base_dir <- "/path/to/your/data"
subject_id <- "P001"

# Run analysis
results <- run_quality_analysis(base_dir, subject_id, save_plots = TRUE)

# Results are saved to: /path/to/your/data/P001/quality_analysis/
```

### 3. Batch Processing
```r
# Process all subjects in the directory
batch_results <- run_batch_analysis(base_dir, save_plots = TRUE)

# Or specify particular subjects
subject_list <- c("P001", "P002", "P003")
batch_results <- run_batch_analysis(base_dir, subject_ids = subject_list)

# Summary saved to: /path/to/your/data/batch_summary.csv
```

### 4. Memory-Efficient Batch Processing (Recommended for >10 subjects)
```r
batch_results <- run_batch_analysis(
  base_dir = "/path/to/data",
  save_plots = TRUE,
  keep_full_results = FALSE,  # Reduces memory usage by ~75%
  show_progress = TRUE         # Shows progress bar (requires 'progress' package)
)
```

## Output Files

### For Each Subject
When `save_plots = TRUE`, the following files are created in `subject_id/quality_analysis/`:

1. **quality_timeseries.png** - Time series of gaze events with blink periods highlighted
2. **blink_distribution.png** - Histogram of blink durations
3. **pupil_diameter.png** - Pupil diameter over time with smoothing
4. **quality_summary.png** - Bar chart comparing traditional vs enhanced methods
5. **quality_overview.png** - Combined 2x2 grid of all plots

### Batch Processing
- **batch_summary.csv** - Summary table with metrics for all subjects:
  - Total samples
  - Traditional usability rate
  - Enhanced usability rate
  - Improvement
  - Blink count and rate

## Output Interpretation

### Console Output
```
=== Traditional Quality Assessment ===
Total samples: 15000
Usable samples: 12000 (80.0%)
Excluded samples: 3000 (20.0%)

=== Enhanced Quality Assessment ===
Total samples: 15000
Usable samples: 13500 (90.0%)

Blink period analysis:
  Samples in blink periods: 3000
  Usable samples in blink periods: 1500 (50.0%)

=== Method Comparison ===
Traditional method: 80.0% usable
Enhanced method: 90.0% usable
Improvement: +10.0 percentage points (+12.5%)
```

### Quality Metrics

- **Usability Rate:** Percentage of samples meeting quality criteria
- **Recovery Rate:** Percentage of blink-period samples that are actually usable
- **Blink Rate:** Blinks per minute (typical: 10-20/min)
- **Blink Duration:** Typical range: 100-400ms

## Advanced Usage

### Custom Thresholds
```r
# Adjust quality assessment parameters
enhanced_result <- assess_enhanced_quality(
  gaze_data,
  pupil_diameter_threshold = 1.0,  # Minimum pupil diameter (mm)
  min_valid_ratio = 0.7            # Minimum quality score (0-1)
)
```

### Regenerate Plots Only
```r
# Load data without re-running analysis
gaze_data <- load_gaze_data(base_dir, subject_id)
blink_result <- analyze_blinks(gaze_data)

# Generate specific plots
plot_blink_distribution(blink_result$blink_data)
plot_pupil_diameter(gaze_data)
```

### Access Results Programmatically
```r
results <- run_quality_analysis(base_dir, subject_id, save_plots = FALSE)

# Access components
gaze_data <- results$gaze_data
traditional_stats <- results$traditional_result$stats
enhanced_stats <- results$enhanced_result$stats
blink_stats <- results$blink_result$stats

# Example: Get usability rate
usability_rate <- results$comparison$enhanced_usability
cat(sprintf("Data quality: %.1f%%\n", usability_rate * 100))
```

## Troubleshooting

### Error: "Missing required columns"
**Cause:** Your gaze.csv doesn't have all required columns
**Solution:** Check the error message for missing column names and verify your data export from Pupil Cloud

### Error: "Gaze file not found"
**Cause:** Incorrect path or subject ID
**Solution:**
- Verify `base_dir` path is correct
- Check that `subject_id` matches the folder name exactly
- Ensure `gaze.csv` exists in the subject folder

### Warning: "Data sanity check found issues"
**Cause:** Unusual values in your data
**Solution:**
- Check the specific warnings
- Verify data export was successful
- Inspect problematic samples manually
- Analysis will continue but verify results

### Memory Issues with Batch Processing
**Solution:** Use memory-efficient mode:
```r
batch_results <- run_batch_analysis(
  base_dir,
  keep_full_results = FALSE  # Reduces memory by ~75%
)
```

### Plots Not Saving
**Cause:** Missing `gridExtra` package or insufficient permissions
**Solution:**
```r
install.packages("gridExtra")
# Or check write permissions on output directory
```

## Version Information

- **Current Version:** 1.1.0 (Fixed Version)
- **Release Date:** 2025-11-17
- **Original Version:** 1.0.0 (2024-11-17)

See [CHANGELOG.md](CHANGELOG.md) for detailed list of fixes and improvements.

## Key Fixes in v1.1.0

✅ Fixed NA handling in blink IDs (could lose 10-30% of data)
✅ Fixed division by zero errors
✅ Fixed pupil diameter averaging for monocular data
✅ Fixed combined plot saving
✅ Added data validation and sanity checks
✅ Optimized batch processing (5x faster, 75% less memory)
✅ Improved error messages

## Citation

If you use this script in your research, please cite:

```
[Your citation information here]
```

## License

[Specify your license here]

## Contact

For questions or issues:
- Check the troubleshooting section above
- Review [CHANGELOG.md](CHANGELOG.md) for known issues
- [Your contact information]

## Acknowledgments

- Developed for Pupil Labs NEON eye-tracking data
- Enhanced quality assessment method developed by [Your Name/Lab]
