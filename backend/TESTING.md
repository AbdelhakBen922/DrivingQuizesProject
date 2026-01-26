# Backend Testing Documentation

This document describes the unit and integration testing setup for the Driving Quiz API backend.

## Test Structure

```
backend/tests/
├── __init__.py
├── conftest.py              # Shared fixtures and configuration
├── unit/                    # Unit tests (isolated, mocked dependencies)
│   ├── __init__.py
│   ├── test_security.py     # Password hashing & JWT token tests
│   ├── test_config.py       # Application settings tests
│   ├── test_auth_service.py # Authentication service tests
│   ├── test_repositories.py # Staff & Student repository tests
│   ├── test_models.py       # Database model tests
│   └── test_database.py     # Database URL conversion tests
└── integration/             # Integration tests (component interactions)
    ├── __init__.py
    └── test_api_health.py   # API health endpoint tests
```

## Running Tests

### Run All Tests

```bash
cd backend
python -m pytest tests/ -v
```

### Run Only Unit Tests

```bash
python -m pytest tests/unit/ -v
```

### Run Only Integration Tests

```bash
python -m pytest tests/integration/ -v
```

### Run Specific Test File

```bash
python -m pytest tests/unit/test_security.py -v
```

### Run Tests with Coverage Report

```bash
pip install pytest-cov
python -m pytest tests/ --cov=app --cov-report=html
```

### Run Tests in Docker

```bash
docker build -t driving-quiz-backend .
docker run driving-quiz-backend python -m pytest tests/ -v
```

## Test Categories

### 1. Security Tests (`test_security.py`)

Tests for password hashing and JWT token operations.

| Test                                                   | Description                             |
| ------------------------------------------------------ | --------------------------------------- |
| `test_get_password_hash_returns_hash`                | Verifies password hashing works         |
| `test_get_password_hash_different_for_same_password` | Confirms salt randomization             |
| `test_verify_password_correct`                       | Validates correct password verification |
| `test_verify_password_incorrect`                     | Validates incorrect password rejection  |
| `test_verify_password_empty_password`                | Handles empty password edge case        |
| `test_create_access_token_basic`                     | Creates basic JWT tokens                |
| `test_create_access_token_with_claims`               | Creates tokens with custom claims       |
| `test_create_access_token_with_custom_expiry`        | Custom token expiration                 |
| `test_decode_access_token_valid`                     | Decodes valid tokens correctly          |
| `test_decode_access_token_invalid`                   | Rejects invalid tokens                  |
| `test_decode_access_token_tampered`                  | Detects tampered tokens                 |
| `test_decode_access_token_empty`                     | Handles empty token edge case           |
| `test_token_roundtrip_student_scope`                 | End-to-end token flow                   |

### 2. Configuration Tests (`test_config.py`)

Tests for application settings.

| Test                                    | Description                         |
| --------------------------------------- | ----------------------------------- |
| `test_settings_has_required_fields`   | All required settings exist         |
| `test_settings_default_app_name`      | Default app name is correct         |
| `test_settings_default_jwt_algorithm` | JWT algorithm defaults to HS256     |
| `test_settings_default_token_expiry`  | Token expiry defaults to 60 minutes |
| `test_settings_instance_creation`     | Custom settings can be created      |

### 3. Authentication Service Tests (`test_auth_service.py`)

Tests for staff and student authentication logic.

| Test                                           | Description                   |
| ---------------------------------------------- | ----------------------------- |
| `test_authenticate_staff_success`            | Valid staff login succeeds    |
| `test_authenticate_staff_invalid_email`      | Invalid email is rejected     |
| `test_authenticate_staff_invalid_password`   | Wrong password is rejected    |
| `test_authenticate_staff_inactive_account`   | Inactive accounts are blocked |
| `test_authenticate_student_success`          | Valid student login succeeds  |
| `test_authenticate_student_invalid_code`     | Invalid student code rejected |
| `test_authenticate_student_invalid_password` | Wrong password rejected       |
| `test_create_staff_token`                    | Staff JWT token creation      |
| `test_create_student_token`                  | Student JWT token creation    |

### 4. Repository Tests (`test_repositories.py`)

Tests for database repository operations (mocked).

**Staff Repository:**

| Test                                  | Description           |
| ------------------------------------- | --------------------- |
| `test_get_staff_by_email_found`     | Find staff by email   |
| `test_get_staff_by_email_not_found` | Handle missing staff  |
| `test_get_staff_by_id_found`        | Find staff by ID      |
| `test_get_staff_by_id_not_found`    | Handle missing staff  |
| `test_create_staff`                 | Create new staff user |

**Student Repository:**

| Test                                              | Description             |
| ------------------------------------------------- | ----------------------- |
| `test_get_student_by_code_found`                | Find student by code    |
| `test_get_student_by_code_not_found`            | Handle missing student  |
| `test_get_student_by_id_found`                  | Find student by ID      |
| `test_get_student_by_id_not_found`              | Handle missing student  |
| `test_get_student_by_code_and_school_found`     | Find by code + school   |
| `test_get_student_by_code_and_school_not_found` | Handle not found        |
| `test_list_students_by_school`                  | List students in school |
| `test_list_students_by_school_with_pagination`  | Paginated listing       |
| `test_list_students_by_school_with_search`      | Search functionality    |

### 5. Model Tests (`test_models.py`)

Tests for SQLAlchemy model definitions.

| Test                                | Description                     |
| ----------------------------------- | ------------------------------- |
| `test_staff_role_values`          | StaffRole enum has all roles    |
| `test_staff_role_value_strings`   | Enum values are correct strings |
| `test_school_creation`            | School model instantiation      |
| `test_school_tablename`           | Correct table name              |
| `test_school_optional_fields`     | Optional fields work            |
| `test_staff_user_creation`        | StaffUser instantiation         |
| `test_staff_user_tablename`       | Correct table name              |
| `test_staff_user_optional_fields` | Optional fields work            |
| `test_student_creation`           | Student instantiation           |
| `test_student_tablename`          | Correct table name              |
| `test_student_optional_fields`    | Optional fields work            |
| `test_student_with_dob`           | Date of birth handling          |

### 6. Database Tests (`test_database.py`)

Tests for database URL conversion.

| Test                                   | Description                      |
| -------------------------------------- | -------------------------------- |
| `test_convert_postgresql_to_psycopg` | URL conversion works             |
| `test_preserve_existing_psycopg_url` | Already converted URLs unchanged |
| `test_preserve_url_with_options`     | Query parameters preserved       |
| `test_non_postgresql_url_unchanged`  | Other DB URLs unchanged          |
| `test_async_database_url_is_set`     | ASYNC_DATABASE_URL configured    |

### 7. API Health Tests (`test_api_health.py`)

Tests for FastAPI application and health endpoint.

| Test                             | Description                      |
| -------------------------------- | -------------------------------- |
| `test_app_creation`            | FastAPI app created successfully |
| `test_app_has_api_router`      | API routes are mounted           |
| `test_app_has_health_endpoint` | Health endpoint exists           |
| `test_health_endpoint_mocked`  | Health check with mocked DB      |

## Test Dependencies

These packages are required for testing (included in `requirements.txt`):

```
pytest==8.0.0
pytest-asyncio==0.23.0
aiosqlite==0.19.0
httpx==0.27.0
```

## Writing New Tests

### Basic Test Structure

```python
import pytest
from unittest.mock import AsyncMock, MagicMock

class TestMyFeature:
    """Tests for my feature."""

    def test_synchronous_function(self):
        """Test a sync function."""
        result = my_function()
        assert result == expected

    @pytest.mark.asyncio
    async def test_async_function(self):
        """Test an async function."""
        result = await my_async_function()
        assert result == expected
```

### Using Fixtures

```python
@pytest.mark.asyncio
async def test_with_session(async_session):
    """Test using the database session fixture."""
    # async_session is an AsyncSession from conftest.py
    result = await some_db_operation(async_session)
    assert result is not None
```

### Mocking Dependencies

```python
from unittest.mock import patch

@pytest.mark.asyncio
async def test_with_mock(self):
    """Test with mocked dependency."""
    with patch("app.module.dependency", return_value=mock_value):
        result = await function_under_test()
        assert result == expected
```

## Configuration

The test configuration is in `pytest.ini`:

```ini
[pytest]
testpaths = tests
asyncio_mode = auto
python_files = test_*.py
python_classes = Test*
python_functions = test_*
addopts = -v --tb=short
```

## Continuous Integration

To run tests in CI/CD:

```yaml
# Example GitHub Actions step
- name: Run Tests
  run: |
    cd backend
    pip install -r requirements.txt
    python -m pytest tests/ -v --tb=short
```
