document.getElementById('upload-button').addEventListener('click', function () {
            document.getElementById('file-input').click(); // Trigger file input click event
        });

        document.getElementById('file-input').addEventListener('change', function () {
            const file = this.files[0];
            // Handle file upload (e.g., send file to server)
            console.log('File selected:', file);
        });

        document.addEventListener('DOMContentLoaded', function () {
            const yourId = '<%= username %>';
            const socket = io();

            // Load chat history
            socket.on('loadHistory', function (history) {
                history.forEach(function (i) {
                    let msg_div = document.getElementById('messages')
                    // Create new div element
                    let newDiv = document.createElement("div")
                    newDiv.classList.add("avatar");
                    // Create new img element
                    let newImg = document.createElement("img")
                    newImg.src = "<% i.profile %>";
                    newImg.alt = "User Avatar";
                    // Append the new img element to the new div element
                    newDiv.appendChild(newImg);
                    // Create new message-bubble div element
                    let newMessageBubble = document.createElement("div")
                    newMessageBubble.classList.add("message-bubble");
                    newMessageBubble.textContent = i.message;
                    // Append the new message-info div element to the new div element
                    let newMessageInfo = document.createElement("div")
                    newMessageInfo.classList.add("message-info");
                    newMessageInfo.textContent = i.time;
                    newMessageBubble.appendChild(newMessageInfo);
                    // Append the new div element to the messages div
                    msg_div.appendChild(newDiv);
                    // Append the new message-bubble div element to the new div element
                    msg_div.appendChild(newMessageBubble);
                });
            });

            // Send message
            document.getElementById('form').addEventListener('submit', function (event) {
                event.preventDefault();

                const message = document.getElementById('m').value;
                socket.emit('chat message', yourId + ": " + message);
                document.getElementById('m').value = '';
            });

            // Receive and display message
            socket.on('chat message', function (msg) {
                let msg_div = document.getElementById('messages')
                // Create new div element
                let newDiv = document.createElement("div")
                newDiv.classList.add("avatar");
                // Create new img element
                let newImg = document.createElement("img")
                newImg.src = "<% i.profile %>";
                newImg.alt = "User Avatar";
                // Append the new img element to the new div element
                newDiv.appendChild(newImg);
                // Create new message-bubble div element
                let newMessageBubble = document.createElement("div")
                newMessageBubble.classList.add("message-bubble");
                newMessageBubble.textContent = msg;
                // Append the new message-info div element to the new div element
                let newMessageInfo = document.createElement("div")
                newMessageInfo.classList.add("message-info");
                let time = new Date();
                let ampm = time.getHours() >= 12 ? 'PM' : 'AM';
                let hours = time.getHours() < 10 ? '0' + time.getHours() : time.getHours();
                let formattedTime = `${hours}:${time.getMinutes()} ${ampm}`;
                newMessageInfo.textContent = formattedTime;
                newMessageBubble.appendChild(newMessageInfo);
                // Append the new div element to the messages div
                msg_div.appendChild(newDiv);
                // Append the new message-bubble div element to the new div element
                msg_div.appendChild(newMessageBubble);
            });

            // Update chat history cookie on the client side
            socket.on('updateHistoryCookie', function (updatedChatsCookie) {
                document.cookie = 'savedChats=' + updatedChatsCookie;
            });

            // Helper function to create a new list item element
            function createListItem(text) {
                const li = document.createElement('li');
                li.textContent = text;
                return li;
            }
        });



        // Define the emojis array
console.log("Emoji picker JavaScript file loaded");


// Toggle emoji picker visibility
document.getElementById('emoji-button').addEventListener('click', function (event) {
    event.stopPropagation(); // Prevent the click event from bubbling up to the document body
    const emojiPicker = document.getElementById('emoji-picker');
    emojiPicker.style.display = emojiPicker.style.display === 'block' ? 'none' : 'block';
});

// Handle emoji selection
document.querySelectorAll('.emoji').forEach(function (emoji) {
    emoji.addEventListener('click', function () {
        const selectedEmoji = this.textContent;
        const messageInput = document.getElementById('message-input');
        messageInput.value += selectedEmoji; // Append selected emoji to the input text

        // Add emoji to recent emojis (maintain stack of 10 emojis)
        if (recentEmojis.length >= 10) {
            // remove index 0 (the oldest emoji)
            recentEmojis.splice(0, 1);
        }
        recentEmojis.push(selectedEmoji); // Add the new emoji to the end
        console.log(recentEmojis)
        renderRecentEmojis(); // Render recent emojis
    });
});

// Handle search input
document.getElementById('search-input').addEventListener('input', function () {
    const searchValue = this.value.toLowerCase();
    document.querySelectorAll('.emoji').forEach(function (emoji) {
        const emojiText = emoji.textContent.toLowerCase();
        if (emojiText.includes(searchValue)) {
            emoji.style.display = 'inline-block'; // Show emoji if it matches search
        } else {
            emoji.style.display = 'none'; // Hide emoji if it doesn't match search
        }
    });

    // Print message to console for debugging
    console.log("Search bar is not working properly. Search value: ", searchValue);
});

// Close emoji picker when clicking outside
document.body.addEventListener('click', function (event) {
    const emojiPicker = document.getElementById('emoji-picker');
    const emojiButton = document.getElementById('emoji-button');

    // Check if the click event originated from within the emoji picker or the emoji button
    if (!emojiPicker.contains(event.target) && event.target !== emojiButton) {
        emojiPicker.style.display = 'none'; // Close the emoji picker
    }
});

// Array to store recent emojis
const recentEmojis = [];

// Function to render recent emojis
function renderRecentEmojis() {
    const recentEmojisList = document.querySelector('.recent-emojis-list');
    recentEmojisList.innerHTML = ''; // Clear previous emojis
    for (let index = recentEmojis.length - 1; index >= 0; index--) {
        const emoji = recentEmojis[index];
        const emojiElement = document.createElement('span');
        emojiElement.classList.add('recent-emoji');
        emojiElement.textContent = emoji;
        emojiElement.addEventListener('click', function () {
            const messageInput = document.getElementById('message-input');
            messageInput.value += emoji; // Append selected emoji to the input text
        });
        recentEmojisList.appendChild(emojiElement);
    }
}
