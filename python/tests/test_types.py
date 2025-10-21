from xcpcio import constants
from xcpcio.types import BalloonColor, ContestOptions, Image, SubmissionReaction


class TestImage:
    """Test cases for Image Pydantic model"""

    def test_image_creation_empty(self):
        """Test Image creation with default values"""
        image = Image()
        assert image.url is None
        assert image.base64 is None
        assert image.preset is None

    def test_image_creation_with_values(self):
        """Test Image creation with provided values"""
        image = Image(url="https://example.com/image.png", base64="base64data", preset="ICPC")
        assert image.url == "https://example.com/image.png"
        assert image.base64 == "base64data"
        assert image.preset == "ICPC"

    def test_image_serialization(self):
        """Test Image serialization and deserialization"""
        image = Image(url="https://test.com/img.jpg", preset="CCPC")

        # Test model_dump
        image_dict = image.model_dump()
        assert image_dict["url"] == "https://test.com/img.jpg"
        assert image_dict["preset"] == "CCPC"
        assert image_dict["base64"] is None

        # Test JSON serialization
        image_json = image.model_dump_json()
        reconstructed_image = Image.model_validate_json(image_json)
        assert reconstructed_image == image


class TestBalloonColor:
    """Test cases for BalloonColor Pydantic model"""

    def test_color_creation(self):
        """Test BalloonColor creation"""
        color = BalloonColor(color="#ffffff", background_color="#000000")
        assert color.color == "#ffffff"
        assert color.background_color == "#000000"

    def test_color_serialization(self):
        """Test BalloonColor serialization and deserialization"""
        color = BalloonColor(color="red", background_color="blue")

        # Test model_dump
        color_dict = color.model_dump()
        assert color_dict["color"] == "red"
        assert color_dict["background_color"] == "blue"

        # Test JSON round-trip
        color_json = color.model_dump_json()
        reconstructed_color = BalloonColor.model_validate_json(color_json)
        assert reconstructed_color == color


class TestContestOptions:
    """Test cases for ContestOptions Pydantic model"""

    def test_contest_options_empty(self):
        """Test ContestOptions with default values"""
        options = ContestOptions()
        assert options.calculation_of_penalty is None
        assert options.submission_timestamp_unit is None
        assert options.has_reaction_videos is None
        assert options.reaction_video_url_template is None

    def test_contest_options_with_values(self):
        """Test ContestOptions with provided values"""
        options = ContestOptions(
            calculation_of_penalty=constants.CALCULATION_OF_PENALTY_IN_SECONDS,
            submission_timestamp_unit=constants.TIME_UNIT_MILLISECOND,
            has_reaction_videos=True,
            reaction_video_url_template="https://videos.com/{team_id}/{problem_id}",
        )

        assert options.calculation_of_penalty == constants.CALCULATION_OF_PENALTY_IN_SECONDS
        assert options.submission_timestamp_unit == constants.TIME_UNIT_MILLISECOND
        assert options.has_reaction_videos is True
        assert options.reaction_video_url_template == "https://videos.com/{team_id}/{problem_id}"

    def test_contest_options_serialization(self):
        """Test ContestOptions serialization"""
        options = ContestOptions(
            calculation_of_penalty=constants.CALCULATION_OF_PENALTY_IN_MINUTES, has_reaction_videos=False
        )

        # Test JSON round-trip
        options_json = options.model_dump_json()
        reconstructed_options = ContestOptions.model_validate_json(options_json)
        assert reconstructed_options == options


class TestSubmissionReaction:
    """Test cases for SubmissionReaction Pydantic model"""

    def test_reaction_empty(self):
        """Test SubmissionReaction with default values"""
        reaction = SubmissionReaction(url="")
        assert reaction.url == ""

    def test_reaction_with_url(self):
        """Test SubmissionReaction with URL"""
        reaction = SubmissionReaction(url="https://reaction.com/video.mp4")
        assert reaction.url == "https://reaction.com/video.mp4"

    def test_reaction_serialization(self):
        """Test SubmissionReaction serialization"""
        reaction = SubmissionReaction(url="https://test.com/reaction.mp4")

        # Test model_dump
        reaction_dict = reaction.model_dump()
        assert reaction_dict["url"] == "https://test.com/reaction.mp4"

        # Test JSON round-trip
        reaction_json = reaction.model_dump_json()
        reconstructed_reaction = SubmissionReaction.model_validate_json(reaction_json)
        assert reconstructed_reaction == reaction

    def test_reaction_no_url_serialization(self):
        """Test SubmissionReaction serialization with no URL"""
        reaction = SubmissionReaction(url="")

        reaction_dict = reaction.model_dump()
        assert reaction_dict["url"] == ""

        # Test JSON round-trip
        reaction_json = reaction.model_dump_json()
        reconstructed_reaction = SubmissionReaction.model_validate_json(reaction_json)
        assert reconstructed_reaction == reaction
