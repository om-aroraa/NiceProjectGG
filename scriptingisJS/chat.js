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