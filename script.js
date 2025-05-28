// Mobile Navigation
const burger = document.querySelector('.burger');
const nav = document.querySelector('.nav-links');
const navLinks = document.querySelectorAll('.nav-links li');

burger.addEventListener('click', () => {
    // Toggle Nav
    nav.classList.toggle('nav-active');
    
    // Animate Links
    navLinks.forEach((link, index) => {
        if (link.style.animation) {
            link.style.animation = '';
        } else {
            link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s`;
        }
    });
    
    // Burger Animation
    burger.classList.toggle('toggle');
});

// Smooth Scrolling for Navigation Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Form Submission
const contactForm = document.getElementById('contactForm');
contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(this);
    const formObject = {};
    formData.forEach((value, key) => {
        formObject[key] = value;
    });
    
    // Here you would typically send the data to a server
    console.log('Form submitted:', formObject);
    
    // Show success message
    alert('Thank you for your message! We will get back to you soon.');
    this.reset();
});

// Event Booking
const bookButtons = document.querySelectorAll('.book-button');
bookButtons.forEach(button => {
    button.addEventListener('click', function() {
        const eventCard = this.closest('.event-card');
        const eventName = eventCard.querySelector('h3').textContent;
        alert(`Thank you for your interest in ${eventName}! Booking functionality will be implemented soon.`);
    });
});

// Scroll to Top Button
const scrollButton = document.createElement('button');
scrollButton.innerHTML = '↑';
scrollButton.className = 'scroll-top';
document.body.appendChild(scrollButton);

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        scrollButton.style.display = 'block';
    } else {
        scrollButton.style.display = 'none';
    }
});

scrollButton.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Add some CSS for the scroll button
const style = document.createElement('style');
style.textContent = `
    .scroll-top {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 40px;
        height: 40px;
        background-color: #3498db;
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        display: none;
        font-size: 20px;
        z-index: 1000;
        transition: background-color 0.3s ease;
    }
    
    .scroll-top:hover {
        background-color: #2980b9;
    }
    
    @keyframes navLinkFade {
        from {
            opacity: 0;
            transform: translateX(50px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    .toggle .line1 {
        transform: rotate(-45deg) translate(-5px, 6px);
    }
    
    .toggle .line2 {
        opacity: 0;
    }
    
    .toggle .line3 {
        transform: rotate(45deg) translate(-5px, -6px);
    }
`;
document.head.appendChild(style);

// Chat Widget Functionality
class ChatWidget {
    constructor() {
        this.widget = document.querySelector('.chat-widget');
        this.header = document.querySelector('.chat-header');
        this.minimizeBtn = document.querySelector('.minimize-btn');
        this.messagesContainer = document.querySelector('.chat-messages');
        this.input = document.querySelector('.chat-input');
        this.sendBtn = document.querySelector('.send-btn');
        // Use a fixed sessionId for testing
        this.sessionId = 'bd19e7ef98d64d2087fe3a7fded57479';
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        this.header.addEventListener('click', () => this.toggleMinimize());
        this.minimizeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleMinimize();
        });
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
    }

    toggleMinimize() {
        this.widget.classList.toggle('minimized');
        const icon = this.minimizeBtn.querySelector('i');
        icon.classList.toggle('fa-minus');
        icon.classList.toggle('fa-plus');
    }

    async sendToWebhook(message) {
        try {
            const payload = {
                sessionId: this.sessionId,
                action: "sendMessage",
                chatInput: message
            };
            
            console.log('Sending message to webhook:', JSON.stringify(payload, null, 2));

            const response = await fetch('http://localhost:5678/webhook/chat-send-msg', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            // Log response details
            console.log('Response status:', response.status);
            console.log('Response headers:', Object.fromEntries(response.headers.entries()));

            // Get the raw response text
            const rawResponse = await response.text();
            console.log('Raw server response:', rawResponse);
            console.log('Raw response length:', rawResponse.length);
            console.log('Response type:', response.type);
            console.log('Response URL:', response.url);

            if (!response.ok) {
                console.error('Webhook response not OK:', {
                    status: response.status,
                    statusText: response.statusText,
                    rawResponse: rawResponse
                });
                throw new Error(`Server responded with ${response.status}: ${rawResponse}`);
            }

            // Handle empty response
            if (!rawResponse || rawResponse.trim() === '') {
                console.log('Received empty response, using default response');
                return {
                    output: "I'm here to help! What would you like to know about the Melbourne Diwali Mela?"
                };
            }

            // Try to parse the response as JSON
            let data;
            try {
                data = JSON.parse(rawResponse);
                console.log('Successfully parsed JSON response:', data);
            } catch (parseError) {
                console.error('Failed to parse server response as JSON:', {
                    error: parseError,
                    rawResponse: rawResponse
                });
                // Return a default response if JSON parsing fails
                return {
                    output: "I'm here to help! What would you like to know about the Melbourne Diwali Mela?"
                };
            }

            // Handle array response format from n8n
            if (Array.isArray(data) && data.length > 0) {
                data = data[0]; // Take the first item from the array
            }
            
            if (!data.output) {
                console.error('Invalid response format:', data);
                // Return a default response if the format is invalid
                return {
                    output: "I'm here to help! What would you like to know about the Melbourne Diwali Mela?"
                };
            }

            return data;
        } catch (error) {
            console.error('Detailed error:', error);
            // Return a default response for any other errors
            return {
                output: "I'm here to help! What would you like to know about the Melbourne Diwali Mela?"
            };
        }
    }

    async sendMessage() {
        const message = this.input.value.trim();
        if (!message) return;

        // Add user message to chat
        this.addMessage(message, 'user');
        this.input.value = '';

        // Show typing indicator
        this.showTypingIndicator();

        try {
            const response = await this.sendToWebhook(message);
            // Remove typing indicator
            this.removeTypingIndicator();
            // Add bot response to chat
            this.addMessage(response.output, 'bot');
        } catch (error) {
            console.error('Error in sendMessage:', error);
            this.removeTypingIndicator();
            // Show more detailed error message
            this.addMessage(`Error: ${error.message}. Please check the console for more details.`, 'bot');
        }
    }

    addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        const icon = document.createElement('i');
        icon.className = sender === 'user' ? 'fas fa-user' : 'fas fa-robot';
        
        const textP = document.createElement('p');
        textP.textContent = text;
        
        contentDiv.appendChild(icon);
        contentDiv.appendChild(textP);
        messageDiv.appendChild(contentDiv);
        
        this.messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }

    showTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'message bot';
        indicator.innerHTML = `
            <div class="message-content">
                <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        this.messagesContainer.appendChild(indicator);
        this.scrollToBottom();
    }

    removeTypingIndicator() {
        const indicator = this.messagesContainer.querySelector('.typing-indicator');
        if (indicator) {
            indicator.closest('.message').remove();
        }
    }

    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
}

// Initialize chat widget
document.addEventListener('DOMContentLoaded', () => {
    new ChatWidget();
});

// Neural Network Animation
function createNeuralNetwork() {
    const container = document.querySelector('.neurons-container');
    const svg = document.querySelector('.neural-connections');
    const numNeurons = 500;
    const neurons = [];
    const connections = [];

    // Create neurons
    for (let i = 0; i < numNeurons; i++) {
        const neuron = document.createElement('div');
        neuron.className = 'neuron';
        
        // Random position within container
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        
        neuron.style.left = `${x}%`;
        neuron.style.top = `${y}%`;
        
        // Random animation delay
        neuron.style.animationDelay = `${Math.random() * 2}s`;
        
        container.appendChild(neuron);
        neurons.push({ x, y, element: neuron });
    }

    // Create connections
    neurons.forEach((neuron, i) => {
        // Connect to 3-5 nearest neighbors
        const numConnections = Math.floor(Math.random() * 3) + 3;
        const distances = neurons.map((n, j) => ({
            index: j,
            distance: Math.sqrt(Math.pow(n.x - neuron.x, 2) + Math.pow(n.y - neuron.y, 2))
        }));

        // Sort by distance and take nearest neighbors
        distances.sort((a, b) => a.distance - b.distance);
        
        for (let j = 1; j <= numConnections; j++) {
            if (j < distances.length) {
                const targetNeuron = neurons[distances[j].index];
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                
                // Convert percentages to pixels
                const x1 = (neuron.x / 100) * svg.viewBox.baseVal.width;
                const y1 = (neuron.y / 100) * svg.viewBox.baseVal.height;
                const x2 = (targetNeuron.x / 100) * svg.viewBox.baseVal.width;
                const y2 = (targetNeuron.y / 100) * svg.viewBox.baseVal.height;
                
                line.setAttribute('x1', x1);
                line.setAttribute('y1', y1);
                line.setAttribute('x2', x2);
                line.setAttribute('y2', y2);
                
                // Random animation delay
                line.style.animationDelay = `${Math.random() * 2}s`;
                
                svg.appendChild(line);
                connections.push(line);
            }
        }
    });
}

// Initialize neural network when the page loads
document.addEventListener('DOMContentLoaded', () => {
    createNeuralNetwork();
}); 