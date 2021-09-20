const tiles = board.querySelectorAll('.tile');
const restartButton = restart;

const Player = (marker) => {
	function getMarker() {
		return marker;
	}

	return { getMarker };
};

const boardController = (() => {
	const markers = { x: 'close', o: 'circle' };
	let restartRotation = 0;

	function addMarker(index, marker) {
		tiles[index].firstElementChild.textContent = markers[marker];
		tiles[index].classList.add('marked');
	}

	function showWinTiles(indexes) {
		for (const i of indexes) {
			tiles[i].classList.add('win');
		}
	}

	function clear() {
		restartRotation -= 360;
		restartButton.firstElementChild.style.transform = `rotateZ(${restartRotation}deg)`;
		for (let tile of tiles) {
			tile.classList.remove('marked', 'win');
			if (tile.firstElementChild.textContent) {
				tile.addEventListener('transitionend', () => tile.firstElementChild.textContent = '', { once: true });
			}
		}
	}

	return { addMarker, showWinTiles, clear };
})();

const gameController = (() => {
	let board = ['', '', '', '', '', '', '', '', ''];
	const winCombos = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
	const playerOne = Player('x');
	const playerTwo = Player('o');
	let currentPlayer = playerOne;
	let gameFinished = false;

	function switchPlayer() {
		currentPlayer = currentPlayer === playerOne ? playerTwo : playerOne;
	}

	function checkWinner() {
		for (const combo of winCombos) {
			const [a, b, c] = [board[combo[0]], board[combo[1]], board[combo[2]]];
			if (a && b && c && a === b && b === c) {
				gameFinished = true;
				boardController.showWinTiles(combo);
				return true;
			}
		}
		return false;
	}

	function addMarker(index) {
		if (!board[index] && !gameFinished) {
			board[index] = currentPlayer.getMarker();
			boardController.addMarker(index, currentPlayer.getMarker());
			if (!checkWinner()) {
				switchPlayer();
			}
		}
	}

	function restart() {
		board = ['', '', '', '', '', '', '', '', ''];
		boardController.clear();
		if (gameFinished) {
			gameFinished = false;
			switchPlayer();
		}
	}

	return { addMarker, restart };
})();

tiles.forEach((tile, index) => tile.addEventListener('click', gameController.addMarker.bind(tile, index)));
restartButton.addEventListener('click', gameController.restart);
