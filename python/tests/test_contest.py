from xcpcio import constants
from xcpcio.types import BalloonColor, Contest, ContestOptions, Image


class TestContest:
    """Test cases for Contest Pydantic model"""

    def test_contest_creation_defaults(self):
        """Test Contest creation with default values"""
        contest = Contest()

        assert contest.contest_name == ""
        assert contest.start_time == 0
        assert contest.end_time == 0
        assert contest.frozen_time == 60 * 60  # 1 hour
        assert contest.thaw_time == 0x3F3F3F3F3F3F3F3F
        assert contest.penalty == 20 * 60  # 20 minutes
        assert contest.problem_id is None
        assert contest.organization == "School"
        assert contest.medal is None
        assert contest.balloon_color is None
        assert contest.logo is None
        assert contest.banner is None
        assert contest.banner_mode is None
        assert contest.badge is None
        assert contest.group is None
        assert contest.tag is None
        assert contest.board_link is None
        assert contest.version is None

        # Check default values
        assert contest.status_time_display == constants.FULL_STATUS_TIME_DISPLAY
        assert contest.options is None

    def test_contest_creation_with_values(self):
        """Test Contest creation with provided values"""
        contest_options = ContestOptions(
            calculation_of_penalty=constants.CALCULATION_OF_PENALTY_IN_SECONDS, has_reaction_videos=True
        )

        contest = Contest(
            contest_name="ICPC World Finals 2024",
            start_time=1234567890,
            end_time=1234567890 + 5 * 60 * 60,  # 5 hours later
            frozen_time=60 * 60,  # 1 hour before end
            penalty=20 * 60,  # 20 minutes
            problem_quantity=12,
            problem_id=["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"],
            organization="ICPC",
            medal="icpc",  # Use Literal value
            options=contest_options,
        )

        assert contest.contest_name == "ICPC World Finals 2024"
        assert contest.start_time == 1234567890
        assert contest.end_time == 1234567890 + 5 * 60 * 60
        assert len(contest.problem_id) == 12
        assert contest.problem_id[0] == "A"
        assert contest.problem_id[-1] == "L"
        assert contest.organization == "ICPC"
        assert contest.medal == "icpc"
        assert contest.options == contest_options

    def test_contest_serialization(self):
        """Test Contest serialization and deserialization"""
        contest = Contest(
            contest_name="Test Contest",
            start_time=1000000000,
            end_time=1000000000 + 60 * 60 * 5,
            problem_id=["A", "B", "C", "D", "E"],
            organization="Test Org",
        )

        # Test model_dump
        contest_dict = contest.model_dump()
        assert contest_dict["contest_name"] == "Test Contest"
        assert contest_dict["start_time"] == 1000000000
        assert contest_dict["organization"] == "Test Org"

        # Test JSON round-trip
        contest_json = contest.model_dump_json()
        reconstructed_contest = Contest.model_validate_json(contest_json)
        assert reconstructed_contest == contest

    def test_contest_with_colors_and_images(self):
        """Test Contest with balloon colors, logo, and banner"""
        colors = [
            BalloonColor(color="#fff", background_color="rgba(255, 0, 0, 0.7)"),
            BalloonColor(color="#000", background_color="rgba(0, 255, 0, 0.7)"),
        ]
        logo = Image(url="https://example.com/logo.png", type="png")
        banner = Image(url="https://example.com/banner.jpg", type="jpg")

        contest = Contest(
            contest_name="Contest with Media",
            balloon_color=colors,
            logo=logo,
            banner=banner,
            banner_mode="ALL",  # Use correct Literal value
        )

        assert len(contest.balloon_color) == 2
        assert contest.balloon_color[0].color == "#fff"
        assert contest.balloon_color[1].background_color == "rgba(0, 255, 0, 0.7)"
        assert contest.logo.url == "https://example.com/logo.png"
        assert contest.banner.url == "https://example.com/banner.jpg"
        assert contest.banner_mode == "ALL"

    def test_append_balloon_color(self):
        """Test append_balloon_color method"""
        contest = Contest()

        # Initially no colors
        assert contest.balloon_color is None

        # Add first color
        red_color = BalloonColor(color="#fff", background_color="red")
        contest.append_balloon_color(red_color)

        assert contest.balloon_color is not None
        assert len(contest.balloon_color) == 1
        assert contest.balloon_color[0] == red_color

        # Add second color
        blue_color = BalloonColor(color="#fff", background_color="blue")
        contest.append_balloon_color(blue_color)

        assert len(contest.balloon_color) == 2
        assert contest.balloon_color[1] == blue_color

    def test_fill_problem_id(self):
        """Test fill_problem_id method"""
        contest = Contest()

        # Initially empty
        assert contest.problem_id is None

        # Fill with A-E
        contest.fill_problem_id(5)

        assert len(contest.problem_id) == 5
        assert contest.problem_id == ["A", "B", "C", "D", "E"]

        # Test with larger quantity
        contest.fill_problem_id(10)

        assert len(contest.problem_id) == 10
        assert contest.problem_id == ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"]

    def test_fill_balloon_color(self):
        """Test fill_balloon_color method"""
        contest = Contest()

        # Initially no colors
        assert contest.balloon_color is None

        # Fill problem IDs first, then balloon colors
        contest.fill_problem_id(3)
        contest.fill_balloon_color()

        assert contest.balloon_color is not None
        assert len(contest.balloon_color) == 3
        assert all(isinstance(color, BalloonColor) for color in contest.balloon_color)

        # Check first few default colors
        assert contest.balloon_color[0].background_color == "rgba(189, 14, 14, 0.7)"
        assert contest.balloon_color[0].color == "#fff"
        assert contest.balloon_color[1].background_color == "rgba(149, 31, 217, 0.7)"
        assert contest.balloon_color[1].color == "#fff"

    def test_contest_round_trip_serialization(self):
        """Test complete round-trip serialization with complex data"""
        # Create a contest with all features
        contest = Contest(
            contest_name="Complex Contest",
            start_time=1234567890,
            end_time=1234567890 + 5 * 60 * 60,
            organization="Complex Org",
            medal="ccpc",  # Use preset instead of dict
        )

        # Add problem IDs and colors
        contest.fill_problem_id(3)
        contest.fill_balloon_color()

        # Add logo
        contest.logo = Image(url="https://example.com/logo.png")

        # Test serialization
        contest_json = contest.model_dump_json()
        reconstructed_contest = Contest.model_validate_json(contest_json)

        # Verify all data is preserved
        assert reconstructed_contest.contest_name == contest.contest_name
        assert reconstructed_contest.start_time == contest.start_time
        assert reconstructed_contest.end_time == contest.end_time
        assert reconstructed_contest.problem_id == contest.problem_id
        assert reconstructed_contest.medal == contest.medal
        assert len(reconstructed_contest.balloon_color) == len(contest.balloon_color)
        assert reconstructed_contest.logo.url == contest.logo.url

    def test_custom_group_and_status_display(self):
        """Test contest with custom group and status display"""
        custom_group = {"team_a": "Team A", "team_b": "Team B"}
        custom_status = {"show_penalty": True, "show_time": False}

        contest = Contest(group=custom_group, status_time_display=custom_status)

        # Custom values should override defaults
        assert contest.group == custom_group
        assert contest.status_time_display == custom_status

        # Test serialization preserves custom values
        contest_json = contest.model_dump_json()
        reconstructed = Contest.model_validate_json(contest_json)
        assert reconstructed.group == custom_group
        assert reconstructed.status_time_display == custom_status
