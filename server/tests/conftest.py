import pytest
from seed import seed_database


@pytest.fixture(scope="session", autouse=True)
def setup_test_database():
    seed_database()
    yield
