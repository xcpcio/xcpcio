import json

import pytest

from xcpcio.types import Team, Teams


class TestTeam:
    """Test cases for the Team dataclass"""

    def test_team_creation(self):
        """Test basic team creation with default values"""
        team = Team()
        assert team.id == ""
        assert team.name == ""
        assert team.organization == ""
        assert team.members is None
        assert team.coaches is None
        assert team.location is None
        assert team.group == []
        assert team.extra == {}

    def test_team_creation_with_values(self):
        """Test team creation with provided values"""
        team = Team(
            id="team001",
            name="Test Team",
            organization="Test University",
            members=["Alice", "Bob", "Charlie"],
            coaches="Dr. Smith",
            location="Building A",
        )

        assert team.id == "team001"
        assert team.name == "Test Team"
        assert team.organization == "Test University"
        assert team.members == ["Alice", "Bob", "Charlie"]
        assert team.coaches == "Dr. Smith"
        assert team.location == "Building A"

    def test_group_management(self):
        """Test add_group and remove_group methods"""
        team = Team(id="test", name="Test Team", organization="Test Org")

        # Test adding groups
        team.add_group("undergraduate")
        assert "undergraduate" in team.group

        team.add_group("local")
        assert "local" in team.group
        assert len(team.group) == 2

        # Test that duplicate groups are not added
        team.add_group("undergraduate")
        assert len(team.group) == 2

        # Test removing groups
        team.remove_group("local")
        assert "local" not in team.group
        assert len(team.group) == 1

        # Test removing non-existent group (should not raise error)
        team.remove_group("nonexistent")
        assert len(team.group) == 1


class TestTeamSerialization:
    """Test cases for Team serialization and deserialization"""

    @pytest.fixture
    def sample_team(self) -> Team:
        """Create a sample team for testing"""
        return Team(
            id="team001",
            name="Alpha Team",
            organization="University A",
            members=["Alice", "Bob", "Charlie"],
            coaches="Dr. Smith",
            location="Building A",
            group=["undergraduate", "local"],
            extra={"room": "101", "contact": "alice@test.edu"},
        )

    def test_model_dump(self, sample_team: Team):
        """Test Team model_dump method"""
        team_dict = sample_team.model_dump()

        assert isinstance(team_dict, dict)
        assert team_dict["id"] == "team001"
        assert team_dict["name"] == "Alpha Team"
        assert team_dict["organization"] == "University A"
        assert team_dict["members"] == ["Alice", "Bob", "Charlie"]
        assert team_dict["coaches"] == "Dr. Smith"
        assert team_dict["location"] == "Building A"
        assert team_dict["group"] == ["undergraduate", "local"]
        assert "extra" not in team_dict  # extra field is excluded from serialization

    def test_model_validate(self, sample_team: Team):
        """Test Team model_validate method"""
        team_dict = sample_team.model_dump()
        reconstructed_team = Team.model_validate(team_dict)

        assert reconstructed_team.id == sample_team.id
        assert reconstructed_team.name == sample_team.name
        assert reconstructed_team.organization == sample_team.organization
        assert reconstructed_team.members == sample_team.members
        assert reconstructed_team.coaches == sample_team.coaches
        assert reconstructed_team.location == sample_team.location
        assert reconstructed_team.group == sample_team.group
        assert reconstructed_team.extra == {}  # extra is not serialized

    def test_model_dump_json(self, sample_team: Team):
        """Test Team model_dump_json method"""
        team_json = sample_team.model_dump_json()

        assert isinstance(team_json, str)
        # Verify it's valid JSON
        parsed = json.loads(team_json)
        assert parsed["id"] == "team001"
        assert parsed["name"] == "Alpha Team"

    def test_model_validate_json(self, sample_team: Team):
        """Test Team model_validate_json method"""
        team_json = sample_team.model_dump_json()
        reconstructed_team = Team.model_validate_json(team_json)

        assert reconstructed_team.id == sample_team.id
        assert reconstructed_team.name == sample_team.name
        assert reconstructed_team.organization == sample_team.organization
        assert reconstructed_team.members == sample_team.members
        assert reconstructed_team.coaches == sample_team.coaches
        assert reconstructed_team.location == sample_team.location
        assert reconstructed_team.group == sample_team.group
        assert reconstructed_team.extra == {}  # extra is not serialized

    def test_round_trip_dict(self, sample_team: Team):
        """Test complete round-trip through dict serialization"""
        team_dict = sample_team.model_dump()
        reconstructed_team = Team.model_validate(team_dict)

        assert reconstructed_team.id == sample_team.id
        assert reconstructed_team.name == sample_team.name
        assert reconstructed_team.organization == sample_team.organization
        assert reconstructed_team.members == sample_team.members
        assert reconstructed_team.coaches == sample_team.coaches
        assert reconstructed_team.location == sample_team.location
        assert reconstructed_team.group == sample_team.group
        assert reconstructed_team.extra == {}  # extra is excluded and won't round-trip

    def test_round_trip_json(self, sample_team: Team):
        """Test complete round-trip through JSON serialization"""
        team_json = sample_team.model_dump_json()
        reconstructed_team = Team.model_validate_json(team_json)

        assert reconstructed_team.id == sample_team.id
        assert reconstructed_team.name == sample_team.name
        assert reconstructed_team.organization == sample_team.organization
        assert reconstructed_team.members == sample_team.members
        assert reconstructed_team.coaches == sample_team.coaches
        assert reconstructed_team.location == sample_team.location
        assert reconstructed_team.group == sample_team.group
        assert reconstructed_team.extra == {}  # extra is excluded and won't round-trip

    def test_minimal_team_serialization(self):
        """Test serialization of team with default/minimal values"""
        minimal_team = Team()

        # Test dict round-trip
        team_dict = minimal_team.model_dump()
        reconstructed_from_dict = Team.model_validate(team_dict)
        assert reconstructed_from_dict == minimal_team

        # Test JSON round-trip
        team_json = minimal_team.model_dump_json()
        reconstructed_from_json = Team.model_validate_json(team_json)
        assert reconstructed_from_json == minimal_team


class TestTeamList:
    """Test cases for Teams (RootModel) serialization and deserialization"""

    @pytest.fixture
    def sample_teams(self) -> Teams:
        """Create a Teams instance for testing"""
        return Teams(
            [
                Team(
                    id="team001",
                    name="Alpha Team",
                    organization="University A",
                    members=["Alice", "Bob"],
                    coaches="Coach A",
                ),
                Team(
                    id="team002",
                    name="Beta Team",
                    organization="University B",
                    members=["Charlie", "David", "Eve"],
                    location="Remote",
                ),
                Team(
                    id="team003",
                    name="Gamma Team",
                    organization="University C",
                    group=["graduate", "international"],
                    extra={"sponsor": "Tech Corp"},
                ),
            ]
        )

    def test_teams_basic_operations(self, sample_teams: Teams):
        """Test basic Teams operations"""
        assert len(sample_teams.root) == 3

        # Test iteration
        team_ids = [team.id for team in sample_teams.root]
        assert "team001" in team_ids
        assert "team002" in team_ids
        assert "team003" in team_ids

    def test_teams_serialization(self, sample_teams: Teams):
        """Test Teams serialization and deserialization"""
        # Test JSON serialization
        teams_json = sample_teams.model_dump_json()
        assert isinstance(teams_json, str)

        # Verify it's a valid JSON array
        parsed = json.loads(teams_json)
        assert isinstance(parsed, list)
        assert len(parsed) == 3

        # Test JSON deserialization
        reconstructed_teams = Teams.model_validate_json(teams_json)
        assert len(reconstructed_teams.root) == 3

        # Verify the data is correct
        reconstructed_teams.root.sort(key=lambda x: x.id)
        assert reconstructed_teams.root[0].id == "team001"
        assert reconstructed_teams.root[1].id == "team002"
        assert reconstructed_teams.root[2].id == "team003"

    def test_teams_round_trip(self, sample_teams: Teams):
        """Test complete round-trip serialization"""
        # Dict round-trip
        teams_dict = sample_teams.model_dump()
        reconstructed_from_dict = Teams.model_validate(teams_dict)
        assert len(reconstructed_from_dict.root) == len(sample_teams.root)

        # JSON round-trip
        teams_json = sample_teams.model_dump_json()
        reconstructed_from_json = Teams.model_validate_json(teams_json)
        assert len(reconstructed_from_json.root) == len(sample_teams.root)

    def test_empty_teams(self):
        """Test operations with empty Teams"""
        empty_teams = Teams([])

        assert len(empty_teams.root) == 0

        # Test serialization
        teams_json = empty_teams.model_dump_json()
        assert teams_json == "[]"

        # Test deserialization
        reconstructed = Teams.model_validate_json("[]")
        assert len(reconstructed.root) == 0
