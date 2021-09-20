const playersBoxes = players.querySelectorAll('.player');
const menuContainer = document.querySelector('#menu-container');
const inputName = document.querySelector('#name');
const nameForm = document.forms['edit-name'];
const tiles = board.querySelectorAll('.tile');
const restartButton = restart;

const Player = (name, type, marker) => {
	function getMarker() {
		return marker;
	}

	return { name, type, getMarker };
};

const boardController = (() => {
	const markers = { x: 'close', o: 'circle' };
	let restartRotation = 0;

	function activePlayer(index) {
		for (const box of playersBoxes) {
			if (box === playersBoxes[index]) {
				box.classList.add('active');
			} else {
				box.classList.remove('active');
			}
		}
	}

	function showMenu(index) {
		menuContainer.classList.remove('hidden');
		menuContainer.dataset.id = index;
		inputName.value = gameController.getPlayerName(index);
		inputName.focus();
	}

	function saveName() {
		if (inputName.checkValidity()) {
			gameController.setPlayerName(menuContainer.dataset.id, inputName.value);
			playersBoxes[menuContainer.dataset.id].firstChild.textContent = inputName.value;
		}
	}

	function closeMenu(e) {
		e.preventDefault();
		if ((e.target === menuContainer.firstElementChild || e.target === nameForm) && nameForm.reportValidity()) {
			menuContainer.classList.add('hidden');
		}
	}

	function addMarker(index, marker) {
		tiles[index].firstElementChild.textContent = markers[marker];
		tiles[index].classList.add('marked');
	}

	function showWinTiles(indexes) {
		for (const i of indexes) {
			tiles[i].classList.add('win');
		}
	}

	function showWinner(index) {
		playersBoxes[index].classList.add('winner');
	}

	function clear() {
		restartRotation -= 360;
		restartButton.firstElementChild.style.transform = `rotateZ(${restartRotation}deg)`;
		for (const tile of tiles) {
			tile.classList.remove('marked', 'win');
			if (tile.firstElementChild.textContent) {
				tile.addEventListener('transitionend', () => tile.firstElementChild.textContent = '', { once: true });
			}
		}
		for (const box of playersBoxes) {
			box.classList.remove('winner');
		}
	}

	return { activePlayer, showMenu, saveName, closeMenu, addMarker, showWinTiles, showWinner, clear };
})();

const gameController = (() => {
	let board = ['', '', '', '', '', '', '', '', ''];
	const winCombos = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
	const players = [Player('Player One', 'human', 'x'), Player('Player Two', 'human', 'o')];
	let currentPlayer = 0;
	let gameFinished = false;

	function getPlayerName(index) {
		return players[index].name;
	}

	function setPlayerName(index, name) {
		players[index].name = name;
	}

	function switchPlayer() {
		currentPlayer = currentPlayer === 0 ? 1 : 0;
		boardController.activePlayer(currentPlayer);
	}

	function checkWinner() {
		for (const combo of winCombos) {
			const [a, b, c] = [board[combo[0]], board[combo[1]], board[combo[2]]];
			if (a && b && c && a === b && b === c) {
				gameFinished = true;
				boardController.showWinTiles(combo);
				boardController.showWinner(currentPlayer);
				break;
			}
		}
		if (board.every(marker => marker)) {
			gameFinished = true;
		}
	}

	function addMarker(index) {
		if (!board[index] && !gameFinished) {
			playerMarker = players[currentPlayer].getMarker();
			board[index] = playerMarker;
			boardController.addMarker(index, playerMarker);
			checkWinner();
			if (!gameFinished) {
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

	return { getPlayerName, setPlayerName, addMarker, restart };
})();

playersBoxes.forEach((box, index) => box.addEventListener('click', boardController.showMenu.bind(box, index)));
inputName.addEventListener('input', boardController.saveName);
nameForm.addEventListener('submit', boardController.closeMenu);
menuContainer.addEventListener('click', boardController.closeMenu);
tiles.forEach((tile, index) => tile.addEventListener('click', gameController.addMarker.bind(tile, index)));
restartButton.addEventListener('click', gameController.restart);
