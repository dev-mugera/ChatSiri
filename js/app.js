// ============================
// APPLICATION STATE
// ============================
const state = {
    currentUser: null,
    currentChat: null,
    users: new Map(),
    conversations: new Map(),
    channels: new Map(),
    apps: [],
    firebase: null,
    auth: null,
    db: null,
    messageListeners: {},
    userStatus: 'online',
    userPresenceRef: null,
    isConnectedRef: null,
    lastOnlineRef: null,
    userConnectionsRef: null,
    userOnlineStatus: {}
};

// ============================
// ENTERPRISE APPS
// ============================
const ENTERPRISE_APPS = [
    {
        id: 'esh',
        name: 'Sales Hub',
        description: 'Enterprise Sales Management',
        icon: 'https://i.postimg.cc/BbZ5c1Tv/20260119_1500_Image_Generation_remix_01kfb1znpceyc8d9dztq9ea0y3_1_removebg_preview(1).png',
        link: 'esh.html',
        category: 'Sales',
        color: '#3b82f6'
    },
    {
        id: 'erh',
        name: 'Resource Hub',
        description: 'Enterprise Resource Management',
        icon: 'https://i.postimg.cc/3rFrpW8P/20260112_1839_Image_Generation_remix_01kesdpw6ce8s88amr0e92g276_removebg_preview_removebg_preview.png',
        link: 'erh.html',
        category: 'Resources',
        color: '#10b981'
    },
    {
        id: 'efh',
        name: 'Finance Hub',
        description: 'Enterprise Financial Management',
        icon: 'https://i.postimg.cc/nLkCKS3J/20260119_1502_Image_Generation_remix_01kfb24hnje88t8jgrmchg3m4w_1_removebg_preview.png',
        link: 'efh.html',
        category: 'Finance',
        color: '#f59e0b'
    },
    {
        id: 'efs',
        name: 'Fleet Hub',
        description: 'Enterprise Fleet Management',
        icon: 'https://i.postimg.cc/MTYB3K5P/20260119_1531_Image_Generation_remix_01kfb3rnfzfzxt9rhe0336w04w_1_removebg_preview.png',
        link: 'efs.html',
        category: 'Operations',
        color: '#ef4444'
    },
    {
        id: 'eth',
        name: 'Talent Hub',
        description: 'Enterprise Talent Management',
        icon: 'https://i.postimg.cc/wvFVykC1/20260119_1539_Image_Generation_remix_01kfb488qbfhz9a354vdfwrwva_1_removebg_preview.png',
        link: 'eth.html',
        category: 'HR',
        color: '#8b5cf6'
    }
];

// ============================
// ENHANCED LOADING ANIMATION
// ============================

// Initialize loading screen with app icons
function initializeLoadingScreen() {
    const loadingGrid = document.getElementById('loadingAppsGrid');
    if (!loadingGrid) return;
    
    // Clear existing content
    loadingGrid.innerHTML = '';
    
    // Create animated app icons for all enterprise apps
    ENTERPRISE_APPS.forEach((app, index) => {
        const appIcon = document.createElement('div');
        appIcon.className = 'loading-app-icon';
        appIcon.style.animationDelay = `${index * 0.15}s`;
        
        const img = document.createElement('img');
        img.src = app.icon;
        img.alt = app.name;
        img.onerror = function() {
            handleImageError(this, app.color, app.name.charAt(0));
        };
        
        appIcon.appendChild(img);
        loadingGrid.appendChild(appIcon);
    });
    
    // Add placeholder icons to fill the 5-column grid if needed
    const remainingIcons = 5 - ENTERPRISE_APPS.length;
    for (let i = 0; i < remainingIcons; i++) {
        const placeholderIcon = document.createElement('div');
        placeholderIcon.className = 'loading-app-icon';
        placeholderIcon.style.animationDelay = `${(ENTERPRISE_APPS.length + i) * 0.15}s`;
        placeholderIcon.innerHTML = `
            <div style="width: 100%; height: 100%; background: linear-gradient(135deg, var(--color-primary), var(--color-secondary)); border-radius: var(--radius); opacity: 0.3;"></div>
        `;
        loadingGrid.appendChild(placeholderIcon);
    }
}

// Update loading message
function updateLoadingMessage(message) {
    const loadingMessage = document.getElementById('loadingMessage');
    if (loadingMessage) {
        loadingMessage.textContent = message;
    }
}

// Simulate loading progress
function simulateLoadingProgress() {
    const progressBar = document.getElementById('loadingProgressBar');
    if (!progressBar) return;
    
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
        }
        progressBar.style.width = `${progress}%`;
    }, 300);
    
    return interval;
}

// Complete loading animation with fade out
async function completeLoading() {
    return new Promise((resolve) => {
        const loadingScreen = document.getElementById('loadingScreen');
        const progressBar = document.getElementById('loadingProgressBar');
        
        // Ensure progress bar is full
        if (progressBar) {
            progressBar.style.width = '100%';
        }
        
        // Update final message
        updateLoadingMessage('Ready to launch');
        
        // Fade out loading screen
        setTimeout(() => {
            loadingScreen.style.transition = 'opacity 0.5s ease';
            loadingScreen.style.opacity = '0';
            
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
                loadingScreen.style.opacity = '1';
                loadingScreen.style.transition = '';
                resolve();
            }, 500);
        }, 800);
    });
}

// ============================
// UTILITY FUNCTIONS
// ============================
function showNotification(title, message, type = 'info') {
    const container = document.getElementById('notificationContainer');
    const notification = document.createElement('div');
    notification.className = 'notification';
    
    const icon = type === 'success' ? 'check-circle' : 
                type === 'error' ? 'exclamation-circle' : 'info-circle';
    
    notification.innerHTML = `
        <div class="notification-icon">
            <i class="fas fa-${icon}"></i>
        </div>
        <div class="notification-content">
            <div class="notification-title">${title}</div>
            <div class="notification-message">${message}</div>
        </div>
    `;
    
    container.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

function formatTime(timestamp) {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 86400000) return 'Today';
    if (diff < 172800000) return 'Yesterday';
    return date.toLocaleDateString();
}

function getInitials(name) {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : '??';
}

function getRandomColor() {
    const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'];
    return colors[Math.floor(Math.random() * colors.length)];
}

function showModal(id) {
    document.getElementById(id).classList.add('active');
}

function hideModal(id) {
    document.getElementById(id).classList.remove('active');
}

function showHomepage() {
    document.getElementById('homepage').style.display = 'flex';
    document.getElementById('chatHeader').style.display = 'none';
    document.getElementById('messagesContainer').style.display = 'none';
    document.getElementById('messageInputContainer').style.display = 'none';
    
    // Clean up all message listeners
    Object.keys(state.messageListeners).forEach(chatId => {
        if (state.messageListeners[chatId]) {
            state.messageListeners[chatId]();
        }
    });
    state.messageListeners = {};
    
    state.currentChat = null;
    updateRecentChats();
}

function showChatView() {
    document.getElementById('homepage').style.display = 'none';
    document.getElementById('chatHeader').style.display = 'flex';
    document.getElementById('messagesContainer').style.display = 'flex';
    document.getElementById('messageInputContainer').style.display = 'block';
}

function getUserStatus(userId) {
    const user = state.users.get(userId);
    if (!user) return 'offline';
    
    // Check if user is online based on presence data
    const isOnline = state.userOnlineStatus[userId];
    if (isOnline === true) {
        return user.status || 'online';
    } else if (isOnline === false) {
        return 'offline';
    }
    
    // Fallback to user's stored status
    return user.status || 'offline';
}

function isUserOnline(userId) {
    return state.userOnlineStatus[userId] === true;
}

function updateUserStatusDisplay(userId) {
    const status = getUserStatus(userId);
    const isOnline = isUserOnline(userId);
    
    // Update in user list modal
    const userItem = document.querySelector(`.user-item[data-user-id="${userId}"]`);
    if (userItem) {
        const statusIndicator = userItem.querySelector('.user-status');
        if (statusIndicator) {
            statusIndicator.className = `user-status ${isOnline ? status : 'offline'}`;
        }
    }
    
    // Update in chat list
    const chatItem = document.querySelector(`.chat-item[data-user-id="${userId}"]`);
    if (chatItem) {
        const statusIndicator = chatItem.querySelector('.chat-status');
        if (statusIndicator) {
            statusIndicator.className = `chat-status ${isOnline ? status : 'offline'}`;
        }
    }
    
    // Update in recent chats
    const recentChatItem = document.querySelector(`.recent-chat-card[data-user-id="${userId}"]`);
    if (recentChatItem) {
        const statusIndicator = recentChatItem.querySelector('.recent-chat-status');
        if (statusIndicator) {
            statusIndicator.className = `recent-chat-status ${isOnline ? status : 'offline'}`;
        }
    }
    
    // Update current chat header if it's with this user
    if (state.currentChat && state.currentChat.type === 'individual' && state.currentChat.user?.uid === userId) {
        updateChatHeader(state.currentChat.user, 'individual');
    }
}

// ============================
// FIREBASE INITIALIZATION
// ============================
async function initializeFirebase() {
    try {
        // Initialize Firebase with config from window object
        if (!window.FIREBASE_CONFIG) {
            throw new Error('Firebase configuration not found');
        }
        
        state.firebase = firebase.initializeApp(window.FIREBASE_CONFIG);
        state.auth = firebase.auth();
        state.db = firebase.database();
        
        // Check auth state
        state.auth.onAuthStateChanged(handleAuthStateChanged);
        
        return true;
    } catch (error) {
        console.error('Firebase initialization failed:', error);
        
        // Show error notification
        showNotification('Error', 'Failed to initialize Firebase. Please check your connection.', 'error');
        
        // Hide loading screen and show login
        document.getElementById('loadingScreen').classList.add('hidden');
        document.getElementById('loginContainer').classList.remove('hidden');
        
        return false;
    }
}

// ============================
// AUTHENTICATION
// ============================
async function handleAuthStateChanged(user) {
    if (user) {
        await handleUserLogin(user);
    } else {
        // Show login screen
        document.getElementById('loginContainer').classList.remove('hidden');
        document.getElementById('workspace').classList.add('hidden');
        document.getElementById('loadingScreen').classList.add('hidden');
    }
}

async function handleUserLogin(user) {
    try {
        updateLoadingMessage('Loading user profile');
        
        // Create or update user in database
        const userRef = state.db.ref(`users/${user.uid}`);
        const snapshot = await userRef.once('value');
        
        if (!snapshot.exists()) {
            // Create new user
            await userRef.set({
                uid: user.uid,
                name: user.displayName || user.email.split('@')[0],
                email: user.email,
                role: 'User',
                status: 'online',
                color: getRandomColor(),
                createdAt: Date.now(),
                lastSeen: Date.now()
            });
        } else {
            // Update user status
            await userRef.update({ 
                status: 'online',
                lastSeen: Date.now() 
            });
        }
        
        updateLoadingMessage('Connecting to workspace');
        
        // Get user data
        const userData = (await userRef.once('value')).val();
        state.currentUser = userData;
        
        // Setup presence system
        setupPresenceSystem();
        
        // Update UI
        updateUserUI();
        
        updateLoadingMessage('Loading users and conversations');
        
        // Load users and conversations
        await loadAllUsers();
        await loadConversations();
        await loadChannels();
        
        updateLoadingMessage('Setting up real-time features');
        
        // Setup real-time listeners
        setupRealtimeListeners();
        
        // Show workspace
        document.getElementById('loginContainer').classList.add('hidden');
        document.getElementById('workspace').classList.remove('hidden');
        
        // Initialize apps
        initializeApps();
        
        // Complete loading animation
        await completeLoading();
        
        showNotification('Welcome', `Logged in as ${userData.name}`, 'success');
        
    } catch (error) {
        console.error('Login error:', error);
        updateLoadingMessage('Login failed');
        showNotification('Error', 'Failed to load user data', 'error');
        
        // Sign out on error
        await state.auth.signOut();
    }
}

// ============================
// PRESENCE SYSTEM
// ============================
function setupPresenceSystem() {
    if (!state.db || !state.currentUser) return;
    
    const userId = state.currentUser.uid;
    
    // User's presence reference
    state.userPresenceRef = state.db.ref(`users/${userId}/presence`);
    state.lastOnlineRef = state.db.ref(`users/${userId}/lastOnline`);
    state.userConnectionsRef = state.db.ref(`user_connections/${userId}`);
    
    // Connected reference
    state.isConnectedRef = state.db.ref('.info/connected');
    
    // Listen for connection status
    state.isConnectedRef.on('value', async (snapshot) => {
        if (snapshot.val() === true) {
            // We're connected (or reconnected)
            
            // Set presence to online
            await state.userPresenceRef.set(true);
            
            // Update user status to online
            await state.db.ref(`users/${userId}`).update({
                status: state.userStatus,
                lastSeen: Date.now()
            });
            
            // Create a connection record
            const connectionRef = state.userConnectionsRef.push();
            await connectionRef.set({
                connectedAt: Date.now(),
                userAgent: navigator.userAgent
            });
            
            // Remove connection when disconnected
            connectionRef.onDisconnect().remove();
            
            // Set presence to offline on disconnect
            state.userPresenceRef.onDisconnect().set(false);
            state.lastOnlineRef.onDisconnect().set(Date.now());
            
            // Update status to offline on disconnect
            const userStatusRef = state.db.ref(`users/${userId}/status`);
            userStatusRef.onDisconnect().set('offline');
            
            // Update lastSeen on disconnect
            const lastSeenRef = state.db.ref(`users/${userId}/lastSeen`);
            lastSeenRef.onDisconnect().set(Date.now());
        }
    });
    
    // Track user activity
    document.addEventListener('mousemove', updateActivity);
    document.addEventListener('keydown', updateActivity);
    document.addEventListener('click', updateActivity);
    
    // Update lastSeen every minute while active
    const activityInterval = setInterval(() => {
        if (state.currentUser) {
            state.db.ref(`users/${userId}`).update({
                lastSeen: Date.now()
            });
        }
    }, 60000);
    
    // Store interval for cleanup
    state.activityInterval = activityInterval;
    
    // Auto-away after 5 minutes of inactivity
    let awayTimeout = setTimeout(() => {
        if (state.userStatus === 'online') {
            updateUserStatus('away');
        }
    }, 300000);
    
    // Update activity function
    function updateActivity() {
        // Clear existing away timeout
        clearTimeout(awayTimeout);
        
        // If user was away, set back to online
        if (state.userStatus === 'away') {
            updateUserStatus('online');
        }
        
        // Update lastSeen
        if (state.currentUser) {
            state.db.ref(`users/${userId}`).update({
                lastSeen: Date.now()
            });
        }
        
        // Set new away timeout
        awayTimeout = setTimeout(() => {
            if (state.userStatus === 'online') {
                updateUserStatus('away');
            }
        }, 300000);
    }
    
    // Handle page visibility
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            // User switched tabs or minimized browser
            if (state.userStatus === 'online') {
                updateUserStatus('away');
            }
        } else {
            // User came back
            if (state.userStatus === 'away') {
                updateUserStatus('online');
                updateActivity();
            }
        }
    });
    
    // Handle beforeunload
    window.addEventListener('beforeunload', async () => {
        // Set user as offline when leaving
        if (state.currentUser) {
            await state.userPresenceRef.set(false);
            await state.lastOnlineRef.set(Date.now());
            await state.db.ref(`users/${userId}`).update({
                status: 'offline',
                lastSeen: Date.now()
            });
        }
        
        // Clean up intervals
        if (state.activityInterval) clearInterval(state.activityInterval);
        clearTimeout(awayTimeout);
    });
}

function updateUserUI() {
    const userAvatar = document.getElementById('userAvatar');
    const userName = document.getElementById('userName');
    const userRole = document.getElementById('userRole');
    
    if (userAvatar && state.currentUser) {
        userAvatar.textContent = getInitials(state.currentUser.name);
        userAvatar.style.background = state.currentUser.color || getRandomColor();
    }
    if (userName && state.currentUser) userName.textContent = state.currentUser.name;
    if (userRole && state.currentUser) userRole.textContent = (state.currentUser.role || 'USER').toUpperCase();
}

// ============================
// USER MANAGEMENT
// ============================
async function loadAllUsers() {
    try {
        const snapshot = await state.db.ref('users').once('value');
        const users = snapshot.val() || {};
        
        state.users.clear();
        
        Object.entries(users).forEach(([uid, user]) => {
            if (uid !== state.currentUser?.uid) {
                state.users.set(uid, user);
                
                // Initially set online status based on presence data
                if (user.presence === true) {
                    state.userOnlineStatus[uid] = true;
                } else {
                    state.userOnlineStatus[uid] = false;
                }
            }
        });
        
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

async function loadUsersForNewChat() {
    const container = document.getElementById('newChatUsers');
    if (!container) return;
    
    // Show loading state
    container.innerHTML = `
        <div class="users-loading">
            <i class="fas fa-spinner fa-spin" style="margin-right: 8px;"></i>
            Loading users...
        </div>
    `;
    
    try {
        await loadAllUsers();
        
        container.innerHTML = '';
        
        if (state.users.size === 0) {
            container.innerHTML = `
                <div class="users-empty">
                    <div class="empty-icon">
                        <i class="fas fa-users"></i>
                    </div>
                    <h3 style="margin-bottom: var(--spacing-sm);">No users found</h3>
                    <p class="text-muted">Add more users to your workspace to start chatting</p>
                </div>
            `;
            return;
        }
        
        // Convert users Map to array and sort alphabetically
        const usersArray = Array.from(state.users.values()).sort((a, b) => 
            a.name.localeCompare(b.name)
        );
        
        // Create user items
        usersArray.forEach(user => {
            const isOnline = isUserOnline(user.uid);
            const status = getUserStatus(user.uid);
            
            const userElement = document.createElement('button');
            userElement.className = 'user-item';
            userElement.dataset.userId = user.uid;
            userElement.innerHTML = `
                <div class="user-avatar" style="background: ${user.color || getRandomColor()}">
                    ${getInitials(user.name)}
                    <div class="user-status ${isOnline ? status : 'offline'}"></div>
                </div>
                <div class="user-info">
                    <div class="user-name">${user.name}</div>
                    <div class="user-role">${user.role || 'User'}</div>
                    <div class="user-email">${user.email || ''}</div>
                </div>
            `;
            
            userElement.addEventListener('click', () => {
                startIndividualChat(user);
                hideModal('newChatModal');
            });
            
            container.appendChild(userElement);
        });
        
        // Add search functionality
        const searchInput = document.getElementById('newChatSearch');
        if (searchInput) {
            // Remove existing listener to avoid duplicates
            const newSearchInput = searchInput.cloneNode(true);
            searchInput.parentNode.replaceChild(newSearchInput, searchInput);
            
            newSearchInput.addEventListener('input', function() {
                const searchTerm = this.value.toLowerCase().trim();
                const allUserItems = container.querySelectorAll('.user-item');
                
                if (!searchTerm) {
                    // Show all users if search is empty
                    allUserItems.forEach(item => {
                        item.style.display = 'flex';
                    });
                    return;
                }
                
                // Filter users
                allUserItems.forEach(item => {
                    const userName = item.querySelector('.user-name').textContent.toLowerCase();
                    const userRole = item.querySelector('.user-role').textContent.toLowerCase();
                    const userEmail = item.querySelector('.user-email').textContent.toLowerCase();
                    
                    if (userName.includes(searchTerm) || 
                        userRole.includes(searchTerm) || 
                        userEmail.includes(searchTerm)) {
                        item.style.display = 'flex';
                    } else {
                        item.style.display = 'none';
                    }
                });
                
                // Check if any users are visible
                const visibleUsers = Array.from(allUserItems).some(item => 
                    item.style.display !== 'none'
                );
                
                if (!visibleUsers) {
                    container.innerHTML = `
                        <div class="users-empty">
                            <div class="empty-icon">
                                <i class="fas fa-search"></i>
                            </div>
                            <h3 style="margin-bottom: var(--spacing-sm);">No matching users</h3>
                            <p class="text-muted">Try a different search term</p>
                        </div>
                    `;
                }
            });
        }
        
    } catch (error) {
        console.error('Error loading users:', error);
        container.innerHTML = `
            <div class="users-empty">
                <div class="empty-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h3 style="margin-bottom: var(--spacing-sm);">Error loading users</h3>
                <p class="text-muted">Please try again later</p>
            </div>
        `;
    }
}

async function loadUsersForChannel() {
    const container = document.getElementById('membersList');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Convert users Map to array and sort alphabetically
    const usersArray = Array.from(state.users.values()).sort((a, b) => 
        a.name.localeCompare(b.name)
    );
    
    usersArray.forEach(user => {
        const isOnline = isUserOnline(user.uid);
        const status = getUserStatus(user.uid);
        
        const memberElement = document.createElement('div');
        memberElement.className = 'member-item';
        memberElement.dataset.userId = user.uid;
        memberElement.style.display = 'flex';
        memberElement.style.alignItems = 'center';
        memberElement.style.gap = 'var(--spacing)';
        memberElement.style.padding = 'var(--spacing-sm)';
        memberElement.style.cursor = 'pointer';
        memberElement.style.transition = 'var(--transition)';
        memberElement.style.borderRadius = 'var(--radius)';
        
        memberElement.innerHTML = `
            <div class="member-checkbox" style="width: 24px; height: 24px; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center;">
                <i class="fas fa-check" style="display: none; font-size: 12px;"></i>
            </div>
            <div class="user-avatar" style="background: ${user.color || getRandomColor()}; width: 36px; height: 36px; border-radius: var(--radius); display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 0.85rem; position: relative;">
                ${getInitials(user.name)}
                <div class="user-status ${isOnline ? status : 'offline'}" style="position: absolute; bottom: -2px; right: -2px; width: 10px; height: 10px;"></div>
            </div>
            <div class="user-info" style="flex: 1;">
                <div class="user-name" style="font-weight: 600; font-size: 0.9rem;">${user.name}</div>
                <div class="user-role" style="font-size: 0.8rem; color: var(--text-tertiary);">${user.role || 'User'} • ${isOnline ? status.charAt(0).toUpperCase() + status.slice(1) : 'Offline'}</div>
            </div>
        `;
        
        memberElement.addEventListener('click', () => {
            const selected = memberElement.classList.toggle('selected');
            const checkbox = memberElement.querySelector('.member-checkbox i');
            checkbox.style.display = selected ? 'block' : 'none';
            updateSelectedCount();
        });
        
        container.appendChild(memberElement);
    });
}

function updateSelectedCount() {
    const count = document.querySelectorAll('.member-item.selected').length;
    document.getElementById('selectedCount').textContent = `${count} selected`;
    
    const channelName = document.getElementById('channelName').value.trim();
    const createBtn = document.getElementById('createChannelBtn');
    createBtn.disabled = !channelName || count === 0;
}

// ============================
// STATUS MANAGEMENT
// ============================
async function updateUserStatus(status) {
    if (!state.currentUser || !state.db) return;
    
    state.userStatus = status;
    
    try {
        // Update in Firebase
        await state.db.ref(`users/${state.currentUser.uid}`).update({
            status: status,
            lastSeen: Date.now()
        });
        
        // Update UI
        const statusIndicator = document.getElementById('statusIndicator');
        const statusText = document.getElementById('statusText');
        const userAvatarStatus = document.getElementById('userAvatarStatus');
        
        if (statusIndicator) {
            statusIndicator.className = `status-indicator ${status}`;
        }
        if (statusText) {
            const statusMap = {
                'online': 'Online',
                'away': 'Away',
                'meeting': 'In a Meeting',
                'offline': 'Offline'
            };
            statusText.textContent = statusMap[status] || status;
        }
        if (userAvatarStatus) {
            userAvatarStatus.className = `user-avatar-status ${status}`;
        }
        
        // Update user's own status display
        updateUserStatusDisplay(state.currentUser.uid);
        
        showNotification('Status Updated', `You are now ${status}`, 'success');
        
    } catch (error) {
        console.error('Error updating status:', error);
        showNotification('Error', 'Failed to update status', 'error');
    }
}

// ============================
// CHAT MANAGEMENT
// ============================
function updateChatsList() {
    const container = document.getElementById('chatList');
    const noChatsMessage = document.getElementById('noChatsMessage');
    const chatsCount = document.getElementById('chatsCount');
    
    if (!container) return;
    
    // Get individual chats from conversations
    const individualChats = Array.from(state.conversations.entries())
        .filter(([id, conv]) => conv.type === 'individual')
        .sort(([, a], [, b]) => (b.lastMessageTime || 0) - (a.lastMessageTime || 0))
        .slice(0, 10);
    
    container.innerHTML = '';
    
    if (individualChats.length === 0) {
        if (noChatsMessage) noChatsMessage.style.display = 'block';
        if (chatsCount) chatsCount.textContent = '0';
        return;
    }
    
    if (noChatsMessage) noChatsMessage.style.display = 'none';
    if (chatsCount) chatsCount.textContent = individualChats.length;
    
    individualChats.forEach(([chatId, conversation]) => {
        const otherUserId = Object.keys(conversation.participants || {})
            .find(id => id !== state.currentUser.uid);
        
        if (!otherUserId) return;
        
        const user = state.users.get(otherUserId) || { name: 'Unknown User', color: getRandomColor() };
        const isOnline = isUserOnline(user.uid);
        const status = getUserStatus(user.uid);
        
        const div = document.createElement('div');
        div.className = 'chat-item';
        div.dataset.userId = user.uid;
        div.innerHTML = `
            <div class="chat-avatar" style="background: ${user.color || getRandomColor()}">
                ${getInitials(user.name)}
                <div class="chat-status ${isOnline ? status : 'offline'}"></div>
            </div>
            <div class="chat-info">
                <div class="chat-name">${user.name}</div>
                <div class="chat-last-message">${conversation.lastMessage || 'No messages yet'}</div>
            </div>
            <div class="chat-time">${conversation.lastMessageTime ? formatTime(conversation.lastMessageTime) : ''}</div>
        `;
        
        div.addEventListener('click', () => startIndividualChat(user));
        container.appendChild(div);
    });
}

function updateChannelsList() {
    const container = document.getElementById('channelList');
    const noChannelsMessage = document.getElementById('noChannelsMessage');
    const channelsCount = document.getElementById('channelsCount');
    
    if (!container) return;
    
    container.innerHTML = '';
    
    if (state.channels.size === 0) {
        if (noChannelsMessage) noChannelsMessage.style.display = 'block';
        if (channelsCount) channelsCount.textContent = '0';
        return;
    }
    
    if (noChannelsMessage) noChannelsMessage.style.display = 'none';
    if (channelsCount) channelsCount.textContent = state.channels.size;
    
    const sortedChannels = Array.from(state.channels.entries())
        .sort(([, a], [, b]) => (b.createdAt || 0) - (a.createdAt || 0))
        .slice(0, 10);
    
    sortedChannels.forEach(([channelId, channel]) => {
        const conversation = state.conversations.get(channelId);
        const div = document.createElement('div');
        div.className = 'channel-item';
        div.innerHTML = `
            <div class="channel-avatar">
                <i class="fas fa-hashtag"></i>
            </div>
            <div class="channel-info">
                <div class="channel-name">${channel.name}</div>
                <div class="channel-last-message">${conversation?.lastMessage || 'No messages yet'}</div>
            </div>
            <div class="channel-time">${conversation?.lastMessageTime ? formatTime(conversation.lastMessageTime) : ''}</div>
        `;
        
        div.addEventListener('click', () => startChannelChat(channel));
        container.appendChild(div);
    });
}

async function startIndividualChat(user) {
    try {
        // Generate chat ID
        const userIds = [state.currentUser.uid, user.uid].sort();
        const chatId = userIds.join('_');
        
        // Set current chat
        state.currentChat = {
            id: chatId,
            user: user,
            type: 'individual'
        };
        
        // Update UI
        updateChatHeader(user, 'individual');
        showChatView();
        
        // Load messages
        await loadMessages(chatId);
        
        // Setup message listener
        setupMessageListener(chatId);
        
        // Create conversation if it doesn't exist
        if (!state.conversations.has(chatId)) {
            const conversationData = {
                id: chatId,
                lastMessage: 'Start of conversation',
                lastMessageTime: Date.now(),
                participants: {
                    [state.currentUser.uid]: state.currentUser,
                    [user.uid]: user
                },
                type: 'individual'
            };
            
            await state.db.ref(`conversations/${chatId}`).set(conversationData);
            state.conversations.set(chatId, conversationData);
            updateChatsList();
        }
        
        updateRecentChats();
        
    } catch (error) {
        console.error('Error starting chat:', error);
        showNotification('Error', 'Failed to start chat', 'error');
    }
}

async function startChannelChat(channel) {
    try {
        // Set current chat
        state.currentChat = {
            id: channel.id,
            channel: channel,
            type: 'channel'
        };
        
        // Update UI
        updateChatHeader(channel, 'channel');
        showChatView();
        
        // Load messages
        await loadMessages(channel.id);
        
        // Setup message listener
        setupMessageListener(channel.id);
        
        updateRecentChats();
        
    } catch (error) {
        console.error('Error starting channel chat:', error);
        showNotification('Error', 'Failed to start channel chat', 'error');
    }
}

function updateChatHeader(data, type) {
    const chatHeaderAvatar = document.getElementById('chatHeaderAvatar');
    let chatHeaderStatus = chatHeaderAvatar.querySelector('.chat-header-status');
    const chatTitle = document.getElementById('chatTitle');
    const chatStatus = document.getElementById('chatStatus');
    
    if (type === 'individual') {
        const isOnline = isUserOnline(data.uid);
        const status = getUserStatus(data.uid);
        
        chatHeaderAvatar.textContent = getInitials(data.name);
        chatHeaderAvatar.style.background = data.color || getRandomColor();
        chatHeaderAvatar.classList.remove('channel');
        
        // Update status indicator
        if (!chatHeaderStatus) {
            const statusElement = document.createElement('div');
            statusElement.className = `chat-header-status ${isOnline ? status : 'offline'}`;
            chatHeaderAvatar.appendChild(statusElement);
        } else {
            chatHeaderStatus.className = `chat-header-status ${isOnline ? status : 'offline'}`;
        }
        
        chatTitle.textContent = data.name;
        chatStatus.innerHTML = `
            <span>${isOnline ? status.charAt(0).toUpperCase() + status.slice(1) : 'Offline'}</span>
        `;
    } else if (type === 'channel') {
        // Remove status indicator for channels
        if (chatHeaderStatus) {
            chatHeaderStatus.remove();
        }
        
        chatHeaderAvatar.innerHTML = '<i class="fas fa-hashtag"></i>';
        chatHeaderAvatar.style.background = 'linear-gradient(135deg, #8b5cf6, #7c3aed)';
        chatHeaderAvatar.classList.add('channel');
        chatTitle.textContent = data.name;
        const memberCount = Object.keys(data.members || {}).length;
        chatStatus.innerHTML = `
            <i class="fas fa-users" style="margin-right: 4px;"></i>
            <span>${memberCount} members</span>
        `;
    }
}

// ============================
// CHANNEL MANAGEMENT
// ============================
async function createChannel() {
    const channelName = document.getElementById('channelName').value.trim();
    const description = document.getElementById('channelDescription').value.trim();
    const selectedMembers = document.querySelectorAll('.member-item.selected');
    
    if (!channelName || selectedMembers.length === 0) {
        showNotification('Error', 'Please provide a channel name and select at least one member', 'error');
        return;
    }
    
    try {
        const channelId = `channel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Create channel data
        const channelData = {
            id: channelId,
            name: channelName,
            description: description,
            createdBy: state.currentUser.uid,
            createdAt: Date.now(),
            members: {
                [state.currentUser.uid]: {
                    uid: state.currentUser.uid,
                    name: state.currentUser.name,
                    role: 'creator',
                    joinedAt: Date.now()
                }
            },
            type: 'channel'
        };
        
        // Add selected members
        selectedMembers.forEach(member => {
            const userId = member.dataset.userId;
            const user = state.users.get(userId);
            if (user) {
                channelData.members[userId] = {
                    uid: userId,
                    name: user.name,
                    role: 'member',
                    joinedAt: Date.now()
                };
            }
        });
        
        // Save channel
        await state.db.ref(`channels/${channelId}`).set(channelData);
        
        // Create conversation
        const conversationData = {
            id: channelId,
            lastMessage: `Channel "${channelName}" was created`,
            lastMessageTime: Date.now(),
            participants: channelData.members,
            type: 'channel',
            channelId: channelId,
            channelName: channelName
        };
        
        await state.db.ref(`conversations/${channelId}`).set(conversationData);
        
        // Clear form
        document.getElementById('channelName').value = '';
        document.getElementById('channelDescription').value = '';
        document.querySelectorAll('.member-item').forEach(item => {
            item.classList.remove('selected');
            const checkbox = item.querySelector('.member-checkbox i');
            if (checkbox) checkbox.style.display = 'none';
        });
        updateSelectedCount();
        
        // Hide modal
        hideModal('newChannelModal');
        
        // Update state
        state.channels.set(channelId, channelData);
        state.conversations.set(channelId, conversationData);
        
        // Update UI
        updateChannelsList();
        updateRecentChats();
        
        showNotification('Success', `Channel "${channelName}" created`, 'success');
        
        // Start the channel chat
        startChannelChat(channelData);
        
    } catch (error) {
        console.error('Error creating channel:', error);
        showNotification('Error', 'Failed to create channel', 'error');
    }
}

async function loadChannels() {
    try {
        const snapshot = await state.db.ref('channels').once('value');
        const channels = snapshot.val() || {};
        
        state.channels.clear();
        
        Object.entries(channels).forEach(([channelId, channel]) => {
            if (channel.members && channel.members[state.currentUser.uid]) {
                state.channels.set(channelId, channel);
            }
        });
        
    } catch (error) {
        console.error('Error loading channels:', error);
    }
}

// ============================
// MESSAGES MANAGEMENT
// ============================
async function loadMessages(chatId) {
    try {
        const container = document.getElementById('messagesContainer');
        if (container) {
            container.innerHTML = '<div class="p-4 text-center text-muted">Loading messages...</div>';
        }
        
        const snapshot = await state.db.ref(`messages/${chatId}`)
            .orderByChild('timestamp')
            .once('value');
        
        const messages = snapshot.val() || {};
        const messageArray = Object.values(messages);
        
        displayMessages(messageArray);
        
    } catch (error) {
        console.error('Error loading messages:', error);
        displayMessages([]);
    }
}

function setupMessageListener(chatId) {
    // Remove existing listener for this chat
    if (state.messageListeners[chatId]) {
        state.messageListeners[chatId]();
        delete state.messageListeners[chatId];
    }
    
    // Setup new listener
    const messagesRef = state.db.ref(`messages/${chatId}`);
    
    const listener = messagesRef
        .orderByChild('timestamp')
        .on('child_added', (snapshot) => {
            const message = snapshot.val();
            
            // Only add to display if we're in the current chat
            if (state.currentChat && state.currentChat.id === chatId) {
                addMessageToDisplay(message);
                
                // Scroll to bottom
                setTimeout(() => {
                    const container = document.getElementById('messagesContainer');
                    if (container) container.scrollTop = container.scrollHeight;
                }, 100);
            }
        });
    
    // Store listener for cleanup
    state.messageListeners[chatId] = () => {
        messagesRef.off('child_added', listener);
    };
}

function displayMessages(messages) {
    const container = document.getElementById('messagesContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (!messages || messages.length === 0) {
        container.innerHTML = `
            <div class="p-4 text-center">
                <div class="mb-2">
                    <i class="fas fa-comments" style="font-size: 48px; color: var(--text-tertiary);"></i>
                </div>
                <h3 class="mb-2">No messages yet</h3>
                <p class="text-muted">Start the conversation!</p>
            </div>
        `;
        return;
    }
    
    // Sort messages by timestamp
    messages.sort((a, b) => a.timestamp - b.timestamp);
    
    let lastDate = null;
    
    messages.forEach(msg => {
        const msgDate = new Date(msg.timestamp).toDateString();
        
        if (msgDate !== lastDate) {
            const dateDiv = document.createElement('div');
            dateDiv.className = 'message-date';
            dateDiv.innerHTML = `<span class="date-label">${formatDate(msg.timestamp)}</span>`;
            container.appendChild(dateDiv);
            lastDate = msgDate;
        }
        
        addMessageToDisplay(msg);
    });
    
    // Scroll to bottom
    setTimeout(() => {
        container.scrollTop = container.scrollHeight;
    }, 100);
}

function addMessageToDisplay(message) {
    const container = document.getElementById('messagesContainer');
    if (!container) return;
    
    const isSent = message.senderId === state.currentUser?.uid;
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isSent ? 'sent' : 'received'}`;
    
    const sender = state.users.get(message.senderId) || { 
        name: message.senderName || 'Unknown User',
        color: getRandomColor()
    };
    
    const avatarText = getInitials(sender.name);
    const avatarColor = sender.color || getRandomColor();
    
    messageDiv.innerHTML = `
        ${!isSent ? `
            <div class="message-avatar" style="background: ${avatarColor}">
                ${avatarText}
            </div>
        ` : ''}
        <div class="message-content">
            <div class="message-bubble">
                <div class="message-text">${message.text || ''}</div>
            </div>
            <div class="message-info">
                ${!isSent && state.currentChat?.type === 'channel' ? `
                    <div class="message-sender">${sender.name}</div>
                ` : ''}
                <div class="message-time">${formatTime(message.timestamp)}</div>
            </div>
        </div>
        ${isSent ? `
            <div class="message-avatar" style="background: ${avatarColor}">
                ${avatarText}
            </div>
        ` : ''}
    `;
    
    container.appendChild(messageDiv);
}

async function sendMessage() {
    const input = document.getElementById('messageInput');
    if (!input || !state.currentChat || !state.currentUser) return;
    
    const text = input.value.trim();
    if (!text) return;
    
    try {
        const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const messageData = {
            id: messageId,
            senderId: state.currentUser.uid,
            senderName: state.currentUser.name,
            text: text,
            timestamp: Date.now(),
            read: false
        };
        
        // Save message
        await state.db.ref(`messages/${state.currentChat.id}/${messageId}`).set(messageData);
        
        // Update conversation
        await state.db.ref(`conversations/${state.currentChat.id}`).update({
            lastMessage: text,
            lastMessageTime: Date.now(),
            lastMessageSender: state.currentUser.name
        });
        
        // Update local state
        const conversation = state.conversations.get(state.currentChat.id);
        if (conversation) {
            conversation.lastMessage = text;
            conversation.lastMessageTime = Date.now();
            conversation.lastMessageSender = state.currentUser.name;
        }
        
        // Clear input
        input.value = '';
        document.getElementById('sendBtn').disabled = true;
        
        // Auto-resize textarea
        input.style.height = 'auto';
        
        // Update UI
        updateChatsList();
        updateRecentChats();
        
    } catch (error) {
        console.error('Error sending message:', error);
        showNotification('Error', 'Failed to send message', 'error');
    }
}

// ============================
// CONVERSATIONS
// ============================
async function loadConversations() {
    try {
        const snapshot = await state.db.ref('conversations').once('value');
        const conversations = snapshot.val() || {};
        
        state.conversations.clear();
        
        Object.entries(conversations).forEach(([chatId, data]) => {
            if (data.participants && data.participants[state.currentUser.uid]) {
                state.conversations.set(chatId, data);
            }
        });
        
        updateChatsList();
        updateChannelsList();
        updateRecentChats();
        
    } catch (error) {
        console.error('Error loading conversations:', error);
    }
}

function updateRecentChats() {
    const container = document.getElementById('recentChatsGrid');
    const noRecentChatsMessage = document.getElementById('noRecentChatsMessage');
    
    if (!container) return;
    
    container.innerHTML = '';
    
    if (state.conversations.size === 0) {
        if (noRecentChatsMessage) noRecentChatsMessage.style.display = 'block';
        return;
    }
    
    if (noRecentChatsMessage) noRecentChatsMessage.style.display = 'none';
    
    const sortedConversations = Array.from(state.conversations.entries())
        .sort(([, a], [, b]) => (b.lastMessageTime || 0) - (a.lastMessageTime || 0))
        .slice(0, 12);
    
    sortedConversations.forEach(([chatId, data]) => {
        if (data.type === 'channel') {
            const channel = state.channels.get(chatId);
            if (!channel) return;
            
            const card = createChannelCard(chatId, channel, data);
            container.appendChild(card);
        } else {
            const otherUserId = Object.keys(data.participants || {})
                .find(id => id !== state.currentUser.uid);
            
            if (!otherUserId) return;
            
            const user = state.users.get(otherUserId) || { name: 'Unknown User', color: getRandomColor() };
            const isOnline = isUserOnline(user.uid);
            const status = getUserStatus(user.uid);
            
            const card = createIndividualChatCard(chatId, user, data, isOnline, status);
            container.appendChild(card);
        }
    });
}

function createChannelCard(chatId, channel, conversation) {
    const card = document.createElement('div');
    card.className = 'recent-chat-card';
    card.innerHTML = `
        <div class="recent-chat-avatar channel">
            <i class="fas fa-hashtag"></i>
        </div>
        <div class="recent-chat-info">
            <div class="recent-chat-name channel">${channel.name}</div>
            <div class="recent-chat-last-message">${conversation.lastMessage || 'No messages yet'}</div>
        </div>
        <div class="recent-chat-time">${conversation.lastMessageTime ? formatTime(conversation.lastMessageTime) : ''}</div>
    `;
    
    card.addEventListener('click', () => startChannelChat(channel));
    
    return card;
}

function createIndividualChatCard(chatId, user, conversation, isOnline, status) {
    const card = document.createElement('div');
    card.className = 'recent-chat-card';
    card.dataset.userId = user.uid;
    card.innerHTML = `
        <div class="recent-chat-avatar" style="background: ${user.color || getRandomColor()}">
            ${getInitials(user.name)}
            <div class="recent-chat-status ${isOnline ? status : 'offline'}"></div>
        </div>
        <div class="recent-chat-info">
            <div class="recent-chat-name">${user.name}</div>
            <div class="recent-chat-last-message">${conversation.lastMessage || 'No messages yet'}</div>
        </div>
        <div class="recent-chat-time">${conversation.lastMessageTime ? formatTime(conversation.lastMessageTime) : ''}</div>
    `;
    
    card.addEventListener('click', () => startIndividualChat(user));
    
    return card;
}

// ============================
// REAL-TIME LISTENERS
// ============================
function setupRealtimeListeners() {
    if (!state.db) return;
    
    // User presence changes
    state.db.ref('users').on('child_changed', (snapshot) => {
        const user = snapshot.val();
        const userId = snapshot.key;
        
        if (userId === state.currentUser?.uid) return;
        
        // Update user data
        state.users.set(userId, user);
        
        // Update online status based on presence
        if (user.presence !== undefined) {
            state.userOnlineStatus[userId] = user.presence;
        }
        
        // Update UI
        updateUserStatusDisplay(userId);
    });
    
    // User added
    state.db.ref('users').on('child_added', (snapshot) => {
        const user = snapshot.val();
        const userId = snapshot.key;
        
        if (userId !== state.currentUser?.uid) {
            state.users.set(userId, user);
            
            // Set online status based on presence
            if (user.presence !== undefined) {
                state.userOnlineStatus[userId] = user.presence;
            } else {
                state.userOnlineStatus[userId] = false;
            }
        }
    });
    
    // New conversations
    state.db.ref('conversations').on('child_added', (snapshot) => {
        const conversation = snapshot.val();
        if (conversation.participants && conversation.participants[state.currentUser.uid]) {
            state.conversations.set(snapshot.key, conversation);
            updateChatsList();
            updateChannelsList();
            updateRecentChats();
        }
    });
    
    // Updated conversations
    state.db.ref('conversations').on('child_changed', (snapshot) => {
        const conversation = snapshot.val();
        if (conversation.participants && conversation.participants[state.currentUser.uid]) {
            state.conversations.set(snapshot.key, conversation);
            updateChatsList();
            updateChannelsList();
            updateRecentChats();
        }
    });
    
    // New channels
    state.db.ref('channels').on('child_added', (snapshot) => {
        const channel = snapshot.val();
        if (channel.members && channel.members[state.currentUser.uid]) {
            state.channels.set(snapshot.key, channel);
            updateChannelsList();
            updateRecentChats();
        }
    });
    
    // Monitor all users' presence
    state.db.ref('users').on('value', (snapshot) => {
        const users = snapshot.val() || {};
        
        Object.entries(users).forEach(([userId, user]) => {
            if (userId !== state.currentUser?.uid) {
                // Update online status based on presence
                if (user.presence !== undefined) {
                    state.userOnlineStatus[userId] = user.presence;
                }
                
                // Update user data
                state.users.set(userId, user);
            }
        });
        
        // Update UI for all users
        Object.keys(state.userOnlineStatus).forEach(userId => {
            updateUserStatusDisplay(userId);
        });
    });
}

// ============================
// APPS MANAGEMENT
// ============================
function initializeApps() {
    state.apps = ENTERPRISE_APPS;
    renderAppsGrid();
}

function renderAppsGrid() {
    const container = document.getElementById('appsGrid');
    if (!container) return;
    
    container.innerHTML = '';
    
    state.apps.forEach(app => {
        const appElement = document.createElement('div');
        appElement.className = 'app-item';
        appElement.dataset.appId = app.id;
        appElement.innerHTML = `
            <div class="app-icon">
                <img src="${app.icon}" alt="${app.name}" onerror="handleImageError(this, '${app.color}', '${app.name.charAt(0)}')">
            </div>
            <div class="app-name">${app.name}</div>
        `;
        
        appElement.addEventListener('click', () => {
            window.open(app.link, '_blank');
            hideModal('appsPopup');
            showNotification('App Launched', `${app.name} opened in new tab`, 'success');
        });
        
        container.appendChild(appElement);
    });
}

// Handle image loading errors gracefully
function handleImageError(imgElement, color, initial) {
    console.log('Image failed to load, using fallback:', imgElement.alt);
    
    // Replace with fallback SVG
    const fallbackSVG = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
            <rect width="100" height="100" fill="${color}" rx="16"/>
            <text x="50" y="55" font-family="'Plus Jakarta Sans', sans-serif" font-size="36" 
                  fill="white" text-anchor="middle" font-weight="bold">${initial}</text>
        </svg>
    `;
    
    // Create a data URL for the SVG
    const svgData = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(fallbackSVG);
    imgElement.src = svgData;
    imgElement.style.objectFit = 'cover';
}

// ============================
// THEME MANAGEMENT
// ============================
function initializeTheme() {
    const savedTheme = localStorage.getItem('workspace-theme') || 'navy';
    applyTheme(savedTheme);
}

function applyTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('workspace-theme', theme);
    
    // Update theme dropdown
    document.querySelectorAll('.theme-option').forEach(option => {
        option.classList.toggle('active', option.dataset.theme === theme);
    });
}

// ============================
// EVENT LISTENERS
// ============================
function setupEventListeners() {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const loginBtn = document.getElementById('loginBtn');
            
            // Basic validation
            if (!email || !password) {
                document.getElementById('loginError').style.display = 'block';
                return;
            }
            
            loginBtn.disabled = true;
            loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Signing in...</span>';
            
            try {
                await state.auth.signInWithEmailAndPassword(email, password);
                loginForm.reset();
                document.getElementById('loginError').style.display = 'none';
            } catch (error) {
                console.error('Login error:', error);
                document.getElementById('loginError').style.display = 'block';
                loginBtn.disabled = false;
                loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i><span>Sign In</span>';
            }
        });
    }
    
    // New Chat button
    const newChatBtn = document.getElementById('newChatBtn');
    if (newChatBtn) {
        newChatBtn.addEventListener('click', () => {
            showModal('newChatModal');
            loadUsersForNewChat();
        });
    }
    
    // New Channel button
    const newChannelBtn = document.getElementById('newChannelBtn');
    if (newChannelBtn) {
        newChannelBtn.addEventListener('click', () => {
            showModal('newChannelModal');
            loadUsersForChannel();
        });
    }
    
    // Close modals
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal-overlay');
            if (modal) modal.classList.remove('active');
        });
    });
    
    // Close modals when clicking outside
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
    
    // Cancel channel button
    const cancelChannelBtn = document.getElementById('cancelChannelBtn');
    if (cancelChannelBtn) {
        cancelChannelBtn.addEventListener('click', () => {
            hideModal('newChannelModal');
        });
    }
    
    // Create channel button
    const createChannelBtn = document.getElementById('createChannelBtn');
    if (createChannelBtn) {
        createChannelBtn.addEventListener('click', createChannel);
    }
    
    // Channel name input
    const channelNameInput = document.getElementById('channelName');
    if (channelNameInput) {
        channelNameInput.addEventListener('input', updateSelectedCount);
    }
    
    // Message input
    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');
    
    if (messageInput && sendBtn) {
        messageInput.addEventListener('input', () => {
            sendBtn.disabled = !messageInput.value.trim();
            // Auto-resize
            messageInput.style.height = 'auto';
            messageInput.style.height = Math.min(messageInput.scrollHeight, 120) + 'px';
        });
        
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (messageInput.value.trim()) {
                    sendMessage();
                }
            }
        });
        
        sendBtn.addEventListener('click', sendMessage);
    }
    
    // Apps button
    const appsBtn = document.getElementById('appsBtn');
    if (appsBtn) {
        appsBtn.addEventListener('click', () => {
            const popup = document.getElementById('appsPopup');
            popup.classList.toggle('active');
        });
    }
    
    // Apps search
    const appsSearch = document.getElementById('appsSearch');
    if (appsSearch) {
        appsSearch.addEventListener('input', (e) => {
            filterApps(e.target.value);
        });
    }
    
    // Status selector
    const statusBtn = document.getElementById('statusBtn');
    const statusDropdown = document.getElementById('statusDropdown');
    
    if (statusBtn && statusDropdown) {
        statusBtn.addEventListener('click', () => {
            statusDropdown.classList.toggle('active');
        });
        
        document.querySelectorAll('.status-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const status = e.currentTarget.dataset.status;
                updateUserStatus(status);
                statusDropdown.classList.remove('active');
            });
        });
    }
    
    // Theme selector
    const themeBtn = document.getElementById('themeBtn');
    const themeDropdown = document.getElementById('themeDropdown');
    
    if (themeBtn && themeDropdown) {
        themeBtn.addEventListener('click', () => {
            themeDropdown.classList.toggle('active');
        });
        
        document.querySelectorAll('.theme-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const theme = e.currentTarget.dataset.theme;
                applyTheme(theme);
                themeDropdown.classList.remove('active');
            });
        });
    }
    
    // Back to home button
    const backToHomeBtn = document.getElementById('backToHomeBtn');
    if (backToHomeBtn) {
        backToHomeBtn.addEventListener('click', showHomepage);
    }
    
    // Clear chat button
    const clearChatBtn = document.getElementById('clearChatBtn');
    if (clearChatBtn) {
        clearChatBtn.addEventListener('click', async () => {
            if (!state.currentChat) return;
            
            if (confirm('Are you sure you want to clear this chat?')) {
                try {
                    await state.db.ref(`messages/${state.currentChat.id}`).remove();
                    await state.db.ref(`conversations/${state.currentChat.id}`).update({
                        lastMessage: 'Chat cleared',
                        lastMessageTime: Date.now()
                    });
                    
                    document.getElementById('messagesContainer').innerHTML = '';
                    showNotification('Success', 'Chat cleared', 'success');
                } catch (error) {
                    console.error('Error clearing chat:', error);
                    showNotification('Error', 'Failed to clear chat', 'error');
                }
            }
        });
    }
    
    // Clear all chats button
    const clearAllChatsBtn = document.getElementById('clearAllChatsBtn');
    if (clearAllChatsBtn) {
        clearAllChatsBtn.addEventListener('click', async () => {
            if (confirm('Are you sure you want to clear all chats? This cannot be undone.')) {
                try {
                    const promises = [];
                    state.conversations.forEach((conversation, chatId) => {
                        promises.push(state.db.ref(`conversations/${chatId}`).remove());
                        promises.push(state.db.ref(`messages/${chatId}`).remove());
                    });
                    
                    await Promise.all(promises);
                    state.conversations.clear();
                    state.channels.clear();
                    updateChatsList();
                    updateChannelsList();
                    updateRecentChats();
                    showHomepage();
                    showNotification('Success', 'All chats cleared', 'success');
                } catch (error) {
                    console.error('Error clearing chats:', error);
                    showNotification('Error', 'Failed to clear chats', 'error');
                }
            }
        });
    }
    
    // User menu (sign out)
    const userMenu = document.getElementById('userMenu');
    if (userMenu) {
        userMenu.addEventListener('click', async () => {
            if (confirm('Are you sure you want to sign out?')) {
                try {
                    // Clean up presence system
                    if (state.userPresenceRef) {
                        await state.userPresenceRef.set(false);
                    }
                    if (state.lastOnlineRef) {
                        await state.lastOnlineRef.set(Date.now());
                    }
                    
                    // Update user status to offline
                    if (state.currentUser) {
                        await state.db.ref(`users/${state.currentUser.uid}`).update({
                            status: 'offline',
                            lastSeen: Date.now()
                        });
                    }
                    
                    // Clean up intervals
                    if (state.activityInterval) {
                        clearInterval(state.activityInterval);
                    }
                    
                    // Sign out
                    await state.auth.signOut();
                    showNotification('Success', 'Signed out successfully', 'success');
                } catch (error) {
                    console.error('Sign out error:', error);
                    showNotification('Error', 'Failed to sign out', 'error');
                }
            }
        });
    }
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        // Apps popup
        const appsPopup = document.getElementById('appsPopup');
        if (appsPopup && !appsPopup.contains(e.target) && !e.target.closest('#appsBtn')) {
            appsPopup.classList.remove('active');
        }
        
        // Status dropdown
        const statusDropdown = document.getElementById('statusDropdown');
        if (statusDropdown && !statusDropdown.contains(e.target) && !e.target.closest('#statusBtn')) {
            statusDropdown.classList.remove('active');
        }
        
        // Theme dropdown
        const themeDropdown = document.getElementById('themeDropdown');
        if (themeDropdown && !themeDropdown.contains(e.target) && !e.target.closest('#themeBtn')) {
            themeDropdown.classList.remove('active');
        }
    });
    
    // Add close button for apps popup
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const appsPopup = document.getElementById('appsPopup');
            if (appsPopup && appsPopup.classList.contains('active')) {
                appsPopup.classList.remove('active');
            }
            
            // Close all modals
            document.querySelectorAll('.modal-overlay.active').forEach(modal => {
                modal.classList.remove('active');
            });
        }
    });
}

function filterApps(searchTerm) {
    if (!searchTerm) {
        renderAppsGrid();
        return;
    }
    
    const filteredApps = state.apps.filter(app => 
        app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const container = document.getElementById('appsGrid');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (filteredApps.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: var(--spacing-2xl);">
                <i class="fas fa-search" style="font-size: 48px; color: var(--text-tertiary); margin-bottom: var(--spacing);"></i>
                <h3 style="margin-bottom: var(--spacing-sm);">No apps found</h3>
                <p class="text-muted">Try a different search term</p>
            </div>
        `;
        return;
    }
    
    filteredApps.forEach(app => {
        const appElement = document.createElement('div');
        appElement.className = 'app-item';
        appElement.dataset.appId = app.id;
        appElement.innerHTML = `
            <div class="app-icon">
                <img src="${app.icon}" alt="${app.name}" onerror="handleImageError(this, '${app.color}', '${app.name.charAt(0)}')">
            </div>
            <div class="app-name">${app.name}</div>
        `;
        
        appElement.addEventListener('click', () => {
            window.open(app.link, '_blank');
            hideModal('appsPopup');
            showNotification('App Launched', `${app.name} opened in new tab`, 'success');
        });
        
        container.appendChild(appElement);
    });
}

// ============================
// INITIALIZATION
// ============================
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize loading animation
    initializeLoadingScreen();
    const progressInterval = simulateLoadingProgress();
    
    // Update loading messages
    setTimeout(() => updateLoadingMessage('Initializing Enterprise Workspace'), 100);
    setTimeout(() => updateLoadingMessage('Loading Firebase'), 500);
    
    // Initialize theme
    initializeTheme();
    
    // Setup event listeners
    setupEventListeners();
    
    // Initialize Firebase with error handling
    try {
        updateLoadingMessage('Connecting to workspace');
        
        const firebaseInitialized = await initializeFirebase();
        
        if (!firebaseInitialized) {
            updateLoadingMessage('Connection failed');
            clearInterval(progressInterval);
            
            // Show error state
            setTimeout(() => {
                document.getElementById('loadingScreen').classList.add('hidden');
                document.getElementById('loginContainer').classList.remove('hidden');
            }, 1000);
            
            // Add retry button
            const loginCard = document.querySelector('.login-card');
            if (loginCard) {
                const retryBtn = document.createElement('button');
                retryBtn.className = 'login-btn mt-2';
                retryBtn.innerHTML = '<i class="fas fa-redo"></i> Retry Connection';
                retryBtn.addEventListener('click', () => {
                    location.reload();
                });
                loginCard.appendChild(retryBtn);
            }
        } else {
            // If user is already authenticated, handleUserLogin will complete the loading
            // Otherwise, we wait for auth state change
            if (!state.auth.currentUser) {
                updateLoadingMessage('Ready to sign in');
                
                // If no user is signed in, show login after a delay
                setTimeout(() => {
                    clearInterval(progressInterval);
                    document.getElementById('loadingScreen').classList.add('hidden');
                    document.getElementById('loginContainer').classList.remove('hidden');
                }, 1500);
            }
        }
    } catch (error) {
        console.error('Initialization error:', error);
        updateLoadingMessage('Error loading workspace');
        clearInterval(progressInterval);
        
        setTimeout(() => {
            document.getElementById('loadingScreen').classList.add('hidden');
            document.getElementById('loginContainer').classList.remove('hidden');
        }, 1000);
    }
});

// Make handleImageError globally available
window.handleImageError = handleImageError;
