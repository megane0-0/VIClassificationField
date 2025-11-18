# CLAUDE.md - AI Assistant Guide for VIClassificationField

## Repository Overview

**VIClassificationField** is a repository focused on visual field testing and classification in ophthalmology. The project deals with analyzing and classifying visual field test results used for diagnosing and monitoring eye conditions such as glaucoma, retinal diseases, and neurological disorders.

### Repository Information
- **Name**: VIClassificationField
- **Domain**: Ophthalmology / Visual Field Testing
- **Current State**: Early stage - contains reference documentation
- **Primary Language**: TBD (project structure being established)
- **Git Repository**: megane0-0/VIClassificationField

## Domain Context

### Visual Field Testing
Visual field testing measures a patient's entire scope of vision, including peripheral vision. The tests assess:
- **Central Vision**: 0-30 degrees from fixation point
- **Peripheral Vision**: 30-87 degrees from fixation point
- **Sensitivity**: Light detection threshold at various points

### Key Test Patterns (from HFA3)
The repository references Humphrey Field Analyzer (HFA3) test patterns:

#### Threshold Test Patterns
- **Central 30-2**: 76 points, 30° - glaucoma, retinal, neurological
- **Central 24-2**: 54 points, 24° - glaucoma, general, neurological (most common)
- **Central 10-2**: 68 points, 10° - macular, advanced glaucoma
- **Central 24-2C**: 64 points, 24° - combined/enhanced pattern
- **Peripheral 60-4**: 60 points, 30-60° - retinal, glaucoma
- **Macula**: 16 points, 5° - macular testing
- **Nasal Step**: 14 points, 50° - glaucoma screening

#### Test Strategies
- **SITA-Faster**: ~30% faster than SITA-Fast, 50% faster than SITA-Standard
- **SITA-Fast**: Halves testing time vs FastPac
- **SITA-Standard**: Halves testing time vs Full Threshold
- **SITA-SWAP**: Blue-Yellow testing for early glaucoma detection
- **Full Threshold**: Legacy comprehensive testing (4dB then 2dB steps)
- **FastPac**: Faster legacy method (3dB steps, single threshold crossing)

### Clinical Applications
- **Glaucoma**: Progressive optic nerve damage detection and monitoring
- **Retinal Diseases**: Macular degeneration, retinal detachment assessment
- **Neurological Disorders**: Stroke, brain tumors, visual pathway lesions
- **Functional Disability**: Legal blindness, driver's license assessments

## Repository Structure

```
VIClassificationField/
├── .git/                          # Git version control
├── field_test_stimuli.pdf         # HFA3 reference documentation
└── CLAUDE.md                      # This file
```

### Expected Future Structure
As the project develops, expect these directories:

```
VIClassificationField/
├── data/                          # Visual field test data
│   ├── raw/                       # Raw test results
│   ├── processed/                 # Preprocessed data
│   └── annotations/               # Labeled classifications
├── src/                           # Source code
│   ├── preprocessing/             # Data preprocessing modules
│   ├── models/                    # Classification models
│   ├── evaluation/                # Model evaluation tools
│   └── visualization/             # Result visualization
├── notebooks/                     # Jupyter notebooks for analysis
├── tests/                         # Unit and integration tests
├── docs/                          # Additional documentation
├── config/                        # Configuration files
├── requirements.txt               # Python dependencies
└── README.md                      # Project README
```

## Key Files

### field_test_stimuli.pdf
**Purpose**: Reference documentation from HFA3 (Humphrey Field Analyzer 3) Instructions for Use

**Contents**:
- Appendix A: Test Patterns & Parameters
- Threshold test pattern diagrams and specifications
- Suprathreshold test pattern diagrams and specifications
- Test parameter settings (strategies, modes, fixation monitoring)
- Stimulus configurations (color, size, intensity)

**Usage**: This document provides the medical/clinical foundation for understanding:
- What data format visual field tests produce
- How different test patterns are structured
- Clinical significance of different test parameters
- Standard configurations used in ophthalmology

## Development Workflows

### Git Workflow

#### Branch Strategy
- **Main Branch**: TBD (not yet established)
- **Feature Branches**: Use `claude/*` prefix for AI-assisted development
- **Current Branch**: `claude/claude-md-mi4qk58260c0t259-01XZCNekT9kRaE7T9Qe7SgiM`

#### Commit Conventions
Follow conventional commit format:
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `refactor`: Code refactoring
- `test`: Adding/modifying tests
- `chore`: Build process, dependencies, etc.
- `data`: Data additions or modifications

**Examples**:
```
feat(preprocessing): add visual field data normalization
docs: update CLAUDE.md with model architecture
data: add 24-2 test pattern sample dataset
```

#### Push Operations
- Always push to branches starting with `claude/` and ending with session ID
- Use: `git push -u origin <branch-name>`
- Retry up to 4 times with exponential backoff (2s, 4s, 8s, 16s) on network errors

### Code Development Workflow

#### Before Writing Code
1. Understand the clinical context from `field_test_stimuli.pdf`
2. Research relevant visual field testing standards
3. Plan data structures that align with HFA test output formats
4. Consider medical data privacy (HIPAA compliance if applicable)

#### When Implementing Features
1. **Data Handling**: Ensure compatibility with standard visual field formats
2. **Validation**: Cross-reference with clinical standards
3. **Documentation**: Include medical/clinical rationale
4. **Testing**: Validate against known test patterns and expected results

#### Code Review Considerations
- Medical accuracy and clinical validity
- Data privacy and security
- Performance for large datasets (patient records)
- Reproducibility of results
- Proper citation of clinical references

## Key Conventions

### Data Conventions

#### Visual Field Data Points
- **Coordinate System**: Typically (x, y) with origin at fixation point
- **Sensitivity Values**: Measured in decibels (dB), range 0-40+ dB
- **Missing Data**: Handle blind spot and untested points appropriately
- **Eye Laterality**: Distinguish between OD (right eye) and OS (left eye)

#### Test Pattern Naming
Follow HFA3 conventions:
- Central patterns: `central_30-2`, `central_24-2`, `central_10-2`
- Peripheral patterns: `peripheral_60-4`
- Special patterns: `macula`, `nasal_step`

#### File Naming
```
<patient_id>_<eye>_<pattern>_<date>.<ext>
Example: P001_OD_24-2_20251110.csv
```

### Code Conventions

#### Language Choice
- **Python**: Recommended for ML/AI development, medical data processing
- **R**: Alternative for statistical analysis
- **Julia**: For high-performance computation

#### Python Standards (if applicable)
- PEP 8 for style
- Type hints for function signatures
- Docstrings with clinical context
- Use pathlib for file operations
- Pandas for tabular visual field data

#### Naming Conventions
```python
# Classes: PascalCase
class VisualFieldClassifier:
    pass

# Functions: snake_case
def preprocess_hfa_data():
    pass

# Constants: UPPER_SNAKE_CASE
CENTRAL_24_2_POINTS = 54
MAX_SENSITIVITY_DB = 40

# Variables: snake_case
test_pattern = "central_24-2"
sensitivity_threshold = 25
```

### Documentation Conventions

#### Code Documentation
```python
def classify_visual_field(data, pattern="24-2"):
    """
    Classify visual field test results for glaucoma detection.

    Clinical Context:
        Uses the 24-2 test pattern (54 points within central 24 degrees).
        Analyzes deviation from age-matched normative database.

    Args:
        data: Visual field test data with sensitivity values
        pattern: Test pattern name (default: "24-2")

    Returns:
        Classification result with confidence score

    References:
        HFA3 Instructions for Use, Section A (Test Patterns)
    """
    pass
```

#### Medical/Clinical References
Always cite sources when implementing clinical algorithms:
- HFA3 documentation
- Published research papers
- Clinical guidelines (AAO, EGS, etc.)
- Validation studies

### Testing Conventions

#### Test Data
- Use synthetic test patterns for unit tests
- Include edge cases (blind spots, fixation losses)
- Test with all common patterns (30-2, 24-2, 10-2)
- Validate against known clinical cases

#### Test Coverage
- Unit tests for all preprocessing functions
- Integration tests for classification pipelines
- Validation against clinical ground truth
- Performance/speed benchmarks

## AI Assistant Guidelines

### When Working with This Repository

#### Understanding the Domain
1. **Medical Context**: This is ophthalmology/vision science - accuracy is critical
2. **Reference Material**: Always consult `field_test_stimuli.pdf` for test specifications
3. **Clinical Standards**: Visual field testing has established medical standards - follow them
4. **Patient Privacy**: Assume all data is protected health information (PHI)

#### Code Development Priorities
1. **Correctness**: Medical accuracy over performance
2. **Validation**: Cross-check against clinical references
3. **Documentation**: Explain clinical rationale, not just code logic
4. **Reproducibility**: Ensure results are deterministic and traceable

#### Common Tasks

**Adding New Test Pattern Support**:
1. Reference `field_test_stimuli.pdf` for pattern specification
2. Extract point coordinates and grid structure
3. Implement pattern-specific preprocessing
4. Add validation tests
5. Document clinical applications

**Implementing Classification Model**:
1. Research clinical criteria for the condition
2. Design features based on established indicators
3. Validate against known diagnostic criteria
4. Document model rationale and limitations
5. Include performance metrics relevant to clinical use

**Data Processing**:
1. Preserve original data integrity
2. Document all transformations
3. Handle missing data appropriately (blind spot, etc.)
4. Maintain eye laterality information
5. Support standard export formats

### Questions to Ask

When uncertain about implementation:
- What is the clinical significance of this feature?
- How do ophthalmologists interpret this data?
- What are the established diagnostic criteria?
- Are there published validation studies?
- What accuracy/sensitivity/specificity is required clinically?

### Red Flags to Avoid

- **Don't** make clinical assumptions without references
- **Don't** modify test pattern specifications from standards
- **Don't** implement diagnostic algorithms without validation
- **Don't** ignore data privacy considerations
- **Don't** skip documentation of medical rationale

## Resources

### Clinical References
- **HFA3 Instructions**: `field_test_stimuli.pdf` in this repository
- **Perimetric Standards**: See American Academy of Ophthalmology (AAO) guidelines
- **Glaucoma Detection**: European Glaucoma Society (EGS) guidelines

### Technical Resources
- **Data Formats**: DICOM, GDx XML, CSV exports from perimeters
- **Normative Databases**: Age-matched reference data for interpretation
- **Statistical Methods**: Pattern deviation, mean deviation, visual field indices

### Related Fields
- Computer Vision: Image processing of fundus photographs
- Machine Learning: Classification, anomaly detection
- Medical Imaging: OCT (Optical Coherence Tomography) correlation
- Clinical Decision Support: Integration with electronic health records

## Project Goals (Inferred)

Based on the repository name and content, likely objectives include:

1. **Classification**: Automated classification of visual field test results
2. **Pattern Recognition**: Identify characteristic patterns (glaucomatous defects, neurological patterns)
3. **Progression Analysis**: Track changes in visual fields over time
4. **Diagnostic Support**: Assist clinicians in interpreting test results
5. **Research**: Analyze large datasets of visual field tests

## Getting Started (Future)

When the codebase is established, expected workflow:

```bash
# Clone repository
git clone <repository-url>
cd VIClassificationField

# Create virtual environment
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows

# Install dependencies
pip install -r requirements.txt

# Run tests
pytest tests/

# Process sample data
python src/preprocessing/process_vf_data.py --input data/raw --output data/processed
```

## Contributing

### For AI Assistants
1. Read this entire CLAUDE.md before making changes
2. Consult `field_test_stimuli.pdf` for clinical specifications
3. Use the TodoWrite tool to track multi-step tasks
4. Commit frequently with descriptive messages
5. Document clinical rationale in code and commits

### For Human Developers
1. Ensure familiarity with visual field testing concepts
2. Validate AI-generated code against clinical standards
3. Review medical accuracy, not just code quality
4. Add test cases based on real clinical scenarios
5. Update this CLAUDE.md as the project evolves

## Version History

- **2025-11-18**: Created comprehensive CLAUDE.md with domain context and guidelines
- **2025-11-10**: Initial repository creation with HFA3 reference documentation

## Contact & Collaboration

**Repository Owner**: Satoshi Y. (megane0-0)
**Email**: 40444119+megane0-0@users.noreply.github.com

---

*This document is designed to help AI assistants understand and contribute effectively to the VIClassificationField project. Update it as the project structure and conventions evolve.*
