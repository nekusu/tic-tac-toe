const tiles = board.querySelectorAll('.tile');

const Player = (marker) => {
	function getMarker() {
		return marker;
	}

	return { getMarker };
};

const boardController = (() => {
	const markers = { x: 'close', o: 'circle' };

	function addMarker(index, marker) {
		tiles[index].firstElementChild.textContent = markers[marker];
	}

	return { addMarker };
})();

const gameController = (() => {
	const board = ['', '', '', '', '', '', '', '', ''];
	const playerOne = Player('x');
	const playerTwo = Player('o');
	let currentPlayer = playerOne;

	function switchPlayer() {
		currentPlayer = currentPlayer === playerOne ? playerTwo : playerOne;
	}

	function addMarker(index) {
		if (!board[index]) {
			board[index] = currentPlayer.getMarker();
			boardController.addMarker(index, currentPlayer.getMarker());
			switchPlayer();
		}
	}

	return { addMarker };
})();

tiles.forEach((tile, index) => tile.addEventListener('click', gameController.addMarker.bind(tile, index)));
