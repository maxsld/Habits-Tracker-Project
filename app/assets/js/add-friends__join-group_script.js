function addDigit(nbr) {
    const input = document.getElementById('inputAddFriends');
    input.value += nbr;
}

function removeLastDigit() {
    const input = document.getElementById('inputAddFriends');
    input.value = input.value.slice(0, -1);
}

function clearDigits() {
    const input = document.getElementById('inputAddFriends');
    input.value = input.value = '';
}
