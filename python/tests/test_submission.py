import json

import pytest

from xcpcio import constants
from xcpcio.types import SubmissionReaction, Submission, Submissions


class TestSubmission:
    """Test cases for Submission Pydantic model"""

    def test_submission_creation_defaults(self):
        """Test Submission creation with default values"""
        submission = Submission()
        assert submission.id is None
        assert submission.team_id == ""
        assert submission.problem_id == 0
        assert submission.timestamp == 0
        assert submission.status == constants.SUBMISSION_STATUS_UNKNOWN
        assert submission.time is None
        assert submission.language is None
        assert submission.is_ignore is None
        assert submission.reaction is None

    def test_submission_creation_with_values(self):
        """Test Submission creation with provided values"""
        reaction = SubmissionReaction(url="https://reaction.com/video.mp4")
        submission = Submission(
            id="sub_001",
            status=constants.SUBMISSION_STATUS_ACCEPTED,
            team_id="team001",
            problem_id=1,
            timestamp=1234567890,
            time=120,
            language="Python",
            is_ignore=False,
            reaction=reaction,
        )

        assert submission.id == "sub_001"
        assert submission.status == constants.SUBMISSION_STATUS_ACCEPTED
        assert submission.team_id == "team001"
        assert submission.problem_id == 1
        assert submission.timestamp == 1234567890
        assert submission.time == 120
        assert submission.language == "Python"
        assert not submission.is_ignore
        assert submission.reaction == reaction
        assert submission.reaction.url == "https://reaction.com/video.mp4"

    def test_submission_serialization(self):
        """Test Submission serialization and deserialization"""
        submission = Submission(
            id="sub_002",
            status=constants.SUBMISSION_STATUS_WRONG_ANSWER,
            team_id="team002",
            problem_id=3,
            timestamp=1234567891,
            time=300,
            language="C++",
        )

        # Test model_dump
        submission_dict = submission.model_dump()
        assert submission_dict["id"] == "sub_002"
        assert submission_dict["status"] == constants.SUBMISSION_STATUS_WRONG_ANSWER
        assert submission_dict["team_id"] == "team002"
        assert submission_dict["problem_id"] == 3
        assert submission_dict["timestamp"] == 1234567891
        assert submission_dict["time"] == 300
        assert submission_dict["language"] == "C++"
        assert submission_dict["is_ignore"] is None
        assert submission_dict["reaction"] is None

        # Test JSON round-trip
        submission_json = submission.model_dump_json()
        reconstructed_submission = Submission.model_validate_json(submission_json)
        assert reconstructed_submission == submission

    def test_submission_with_reaction_serialization(self):
        """Test Submission with Reaction serialization"""
        reaction = SubmissionReaction(url="https://example.com/reaction.mp4")
        submission = Submission(
            id="sub_003",
            status=constants.SUBMISSION_STATUS_ACCEPTED,
            team_id="team003",
            problem_id=2,
            timestamp=1234567892,
            reaction=reaction,
        )

        # Test model_dump
        submission_dict = submission.model_dump()
        assert submission_dict["reaction"]["url"] == "https://example.com/reaction.mp4"

        # Test JSON round-trip
        submission_json = submission.model_dump_json()
        reconstructed_submission = Submission.model_validate_json(submission_json)
        assert reconstructed_submission == submission
        assert reconstructed_submission.reaction.url == "https://example.com/reaction.mp4"


class TestSubmissions:
    """Test cases for Submissions RootModel"""

    @pytest.fixture
    def sample_submissions(self) -> Submissions:
        """Create sample submissions for testing"""
        return Submissions(
            [
                Submission(
                    id="sub_001",
                    status=constants.SUBMISSION_STATUS_ACCEPTED,
                    team_id="team001",
                    problem_id=1,
                    timestamp=1234567890,
                    time=120,
                    language="Python",
                ),
                Submission(
                    id="sub_002",
                    status=constants.SUBMISSION_STATUS_WRONG_ANSWER,
                    team_id="team002",
                    problem_id=2,
                    timestamp=1234567891,
                    time=300,
                    language="C++",
                    reaction=SubmissionReaction(url="https://reaction.com/video.mp4"),
                ),
                Submission(
                    id="sub_003",
                    status=constants.SUBMISSION_STATUS_TIME_LIMIT_EXCEEDED,
                    team_id="team003",
                    problem_id=1,
                    timestamp=1234567892,
                    time=600,
                    language="Java",
                ),
            ]
        )

    def test_submissions_basic_operations(self, sample_submissions: Submissions):
        """Test basic Submissions operations"""
        assert len(sample_submissions.root) == 3

        # Test iteration
        statuses = [sub.status for sub in sample_submissions.root]
        assert constants.SUBMISSION_STATUS_ACCEPTED in statuses
        assert constants.SUBMISSION_STATUS_WRONG_ANSWER in statuses
        assert constants.SUBMISSION_STATUS_TIME_LIMIT_EXCEEDED in statuses

    def test_submissions_serialization(self, sample_submissions: Submissions):
        """Test Submissions serialization and deserialization"""
        # Test JSON serialization
        submissions_json = sample_submissions.model_dump_json()
        assert isinstance(submissions_json, str)

        # Verify it's a valid JSON array
        parsed = json.loads(submissions_json)
        assert isinstance(parsed, list)
        assert len(parsed) == 3

        # Check first submission data
        assert parsed[0]["status"] == constants.SUBMISSION_STATUS_ACCEPTED
        assert parsed[0]["team_id"] == "team001"
        assert parsed[0]["problem_id"] == 1

        # Test JSON deserialization
        reconstructed_submissions = Submissions.model_validate_json(submissions_json)
        assert len(reconstructed_submissions.root) == 3

        # Verify the data is correct
        assert reconstructed_submissions.root[0].status == constants.SUBMISSION_STATUS_ACCEPTED
        assert reconstructed_submissions.root[1].status == constants.SUBMISSION_STATUS_WRONG_ANSWER
        assert reconstructed_submissions.root[2].status == constants.SUBMISSION_STATUS_TIME_LIMIT_EXCEEDED

        # Check reaction is preserved
        assert reconstructed_submissions.root[1].reaction.url == "https://reaction.com/video.mp4"

    def test_submissions_round_trip(self, sample_submissions: Submissions):
        """Test complete round-trip serialization"""
        # Dict round-trip
        submissions_dict = sample_submissions.model_dump()
        reconstructed_from_dict = Submissions.model_validate(submissions_dict)
        assert len(reconstructed_from_dict.root) == len(sample_submissions.root)

        # JSON round-trip
        submissions_json = sample_submissions.model_dump_json()
        reconstructed_from_json = Submissions.model_validate_json(submissions_json)
        assert len(reconstructed_from_json.root) == len(sample_submissions.root)

    def test_empty_submissions(self):
        """Test operations with empty Submissions"""
        empty_submissions = Submissions([])

        assert len(empty_submissions.root) == 0

        # Test serialization
        submissions_json = empty_submissions.model_dump_json()
        assert submissions_json == "[]"

        # Test deserialization
        reconstructed = Submissions.model_validate_json("[]")
        assert len(reconstructed.root) == 0

    def test_submissions_with_minimal_data(self):
        """Test Submissions with minimal submission data"""
        minimal_submissions = Submissions(
            [
                Submission(
                    id="sub_min",
                    status=constants.SUBMISSION_STATUS_ACCEPTED,
                    team_id="team001",
                    problem_id=1,
                    timestamp=123,
                ),
                Submission(id="sub_default"),  # All other defaults
            ]
        )

        # Test serialization
        submissions_json = minimal_submissions.model_dump_json()
        reconstructed = Submissions.model_validate_json(submissions_json)

        assert len(reconstructed.root) == 2
        assert reconstructed.root[0].status == constants.SUBMISSION_STATUS_ACCEPTED
        assert reconstructed.root[1].status == constants.SUBMISSION_STATUS_UNKNOWN  # Default value
