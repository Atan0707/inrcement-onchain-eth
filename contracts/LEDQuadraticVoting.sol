// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract LEDQuadraticVoting {

    uint256 public cycleEndTime;
    uint256 public voteRED;
    uint256 public voteGREEN;
    uint256 public voteBLUE;
    uint256 public constant MAX_TOKENS = 10;

    uint256 public timeRED;
    uint256 public timeGREEN;
    uint256 public timeBLUE;

    // Tracks whether a user has voted in the current cycle
    mapping(address => bool) public hasVoted;
    address[] public voters; // Array to keep track of voters

    event Voted(address indexed voter, uint256 voteRED, uint256 voteGREEN, uint256 voteBLUE);
    event VotingCycleReset(uint256 newEndTime);
    event TimeCalculated(uint256 timeRED, uint256 timeGREEN, uint256 timeBLUE);

    constructor() {
        cycleEndTime = block.timestamp + 1 minutes;
    }

    // Users can vote on LED1 or LED2, with a limit of 10 tokens. Quadratic voting is applied.
    function vote(uint256 _redVotes, uint256 _greenVotes, uint256 _blueVotes) public {
        require(!hasVoted[msg.sender], "You have already voted this cycle");
        require(!isCycleEnded(), "Voting cycle has ended");

        uint256 totalCost = _redVotes + _greenVotes + _blueVotes;
        require(totalCost <= MAX_TOKENS, "Quadratic cost exceeds available tokens");

        voteRED += sqrt(_redVotes);
        voteGREEN += sqrt(_greenVotes);
        voteBLUE += sqrt(_blueVotes);

        hasVoted[msg.sender] = true;  // Mark user as having voted
        voters.push(msg.sender); // Add voter to the list

        emit Voted(msg.sender, _redVotes, _greenVotes, _blueVotes);
    }

    // External function to check if the cycle has ended and reset if necessary
    function getResult() external {
        if (isCycleEnded()) {
            _determineLEDState(); // Determine the final LED state
        }
    }
    function reset() external {
        if (isCycleEnded()) {
            _resetVotingCycle();
             // Reset the voting cycle
        }
        
    }

    // Internal function to reset voting cycle and determine the LED state
    function _resetVotingCycle() internal {
    voteRED = 0;
    voteGREEN = 0;
    voteBLUE = 0;
    cycleEndTime = block.timestamp + 1 minutes;

    // Reset voting permissions for all users
    _resetVoters();

    emit VotingCycleReset(cycleEndTime);
}

    function _determineLEDState() internal returns (uint256, uint256, uint256) {
    uint256 QuadraticVotingRed = voteRED * voteRED;
    uint256 QuadraticVotingGreen = voteGREEN * voteGREEN;
    uint256 QuadraticVotingBlue = voteBLUE * voteBLUE;
    uint256 TotalQuadraticVotesSquared = QuadraticVotingRed + QuadraticVotingGreen + QuadraticVotingBlue;

    if (TotalQuadraticVotesSquared == 0) {
        return (0, 0, 0);
    }

    uint256 precision = 1e18; // 18 decimal places to avoid floating point errors
    timeRED = (QuadraticVotingRed * precision / TotalQuadraticVotesSquared * precision) * 60  ;
    timeGREEN = (QuadraticVotingGreen * precision / TotalQuadraticVotesSquared * precision) * 60;
    timeBLUE = (QuadraticVotingBlue *  precision / TotalQuadraticVotesSquared * precision) * 60;

    emit TimeCalculated(timeRED, timeGREEN, timeBLUE);
    return (timeRED, timeGREEN, timeBLUE);
}

    // Resets the voting status of all users for the new cycle
    function _resetVoters() internal {
        // Reset voting status for all voters
        for (uint256 i = 0; i < voters.length; i++) {
            hasVoted[voters[i]] = false; // Reset the vote status
        }
        delete voters; // Clear the list of voters
    }

    // External function to check if the cycle has ended (useful for front-end)
    function isCycleEnded() public view returns (bool) {
        return block.timestamp >= cycleEndTime;
    }

    // Internal function to calculate the square root (approximation)
    function sqrt(uint x) internal pure returns (uint) {
        uint z = (x + 1) / 2;
        uint y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
        return y;
    }
}
