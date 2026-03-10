// 全局变量
let username = '';
let userHits = 0;
let userFeeds = 0;
let totalHits = 0;
let totalFeeds = 0;
let hitLeader = { name: '暂无', hits: 0 };
let feedLeader = { name: '暂无', feeds: 0 };
let dogElement = null;
let dogContainer = null;
let gameArea = null;
let isMoving = false;
let isGhostMode = false;

// 伪装用户名列表
const impersonationNames = ['维D', 'VD', 'vd', '显微镜鬣狗', '阿德林', '大邦', 'vyden', 'Vyden', 'VYDEN'];

// 初始化
window.onload = function() {
    // 加载本地存储的数据
    loadData();
    
    // 绑定事件
    document.getElementById('enter-btn').addEventListener('click', handleEnter);
    document.getElementById('username').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleEnter();
        }
    });
    
    // 监听用户名输入，显示伪装警告
    document.getElementById('username').addEventListener('input', function(e) {
        const inputName = e.target.value.trim();
        const warningElement = document.getElementById('impersonation-warning');
        
        if (impersonationNames.includes(inputName)) {
            warningElement.style.display = 'block';
        } else {
            warningElement.style.display = 'none';
        }
    });
    
    // 获取DOM元素
    dogElement = document.getElementById('dog');
    dogContainer = document.getElementById('dog-container');
    gameArea = document.getElementById('game-area');
    
    // 开始犬神随机游走
    startDogMovement();
};

// 处理用户进入
function handleEnter() {
    const input = document.getElementById('username');
    const name = input.value.trim();
    
    if (name) {
        username = name;
        
        // 检查是否为犬神112
        if (username === '犬神112') {
            isGhostMode = true;
            // 显示幽灵模式提示
            document.getElementById('ghost-mode').style.display = 'block';
        } else {
            isGhostMode = false;
            // 隐藏幽灵模式提示
            document.getElementById('ghost-mode').style.display = 'none';
            // 加载用户数据
            loadUserData();
        }
        
        // 隐藏弹窗
        document.getElementById('welcome-modal').style.display = 'none';
        
        // 更新显示
        updateStats();
        updateLeaderboard();
    }
}

// 加载本地存储的数据
function loadData() {
    const savedData = localStorage.getItem('dogGodSimulator');
    if (savedData) {
        const data = JSON.parse(savedData);
        totalHits = data.totalHits || 0;
        totalFeeds = data.totalFeeds || 0;
        
        // 检查并移除犬神112的排名
        hitLeader = data.hitLeader && data.hitLeader.name !== '犬神112' ? data.hitLeader : { name: '暂无', hits: 0 };
        feedLeader = data.feedLeader && data.feedLeader.name !== '犬神112' ? data.feedLeader : { name: '暂无', feeds: 0 };
        
        // 保存更新后的数据
        saveData();
    }
}

// 加载用户数据
function loadUserData() {
    const userData = localStorage.getItem(`dogGodUser_${username}`);
    if (userData) {
        const data = JSON.parse(userData);
        userHits = data.hits || 0;
        userFeeds = data.feeds || 0;
    }
}

// 保存数据
function saveData() {
    // 幽灵模式不保存数据
    if (isGhostMode) return;
    
    const data = {
        totalHits,
        totalFeeds,
        hitLeader,
        feedLeader
    };
    localStorage.setItem('dogGodSimulator', JSON.stringify(data));
    
    // 保存用户数据
    const userData = {
        hits: userHits,
        feeds: userFeeds
    };
    localStorage.setItem(`dogGodUser_${username}`, JSON.stringify(userData));
}

// 开始犬神随机游走
function startDogMovement() {
    if (isMoving) return;
    
    isMoving = true;
    moveDog();
}

// 犬神随机移动
function moveDog() {
    if (!dogContainer || !gameArea) return;
    
    const gameAreaRect = gameArea.getBoundingClientRect();
    const dogWidth = dogContainer.offsetWidth;
    const dogHeight = dogContainer.offsetHeight;
    
    // 计算随机位置
    const maxX = gameAreaRect.width - dogWidth;
    const maxY = gameAreaRect.height - dogHeight;
    
    const newX = Math.random() * maxX;
    const newY = Math.random() * maxY;
    
    // 设置新位置
    dogContainer.style.left = `${newX}px`;
    dogContainer.style.top = `${newY}px`;
    
    // 随机时间后再次移动
    const moveTime = Math.random() * 2000 + 1000; // 1-3秒
    setTimeout(moveDog, moveTime);
}

// 处理点击事件
function handleClick(event) {
    if (!username) return;
    
    const dogRect = dogContainer.getBoundingClientRect();
    const clickX = event.clientX - gameArea.getBoundingClientRect().left;
    const clickY = event.clientY - gameArea.getBoundingClientRect().top;
    
    // 检查是否点击到犬神
    if (
        clickX >= dogRect.left - gameArea.getBoundingClientRect().left &&
        clickX <= dogRect.right - gameArea.getBoundingClientRect().left &&
        clickY >= dogRect.top - gameArea.getBoundingClientRect().top &&
        clickY <= dogRect.bottom - gameArea.getBoundingClientRect().top
    ) {
        // 揍犬神
        hitDog();
    } else {
        // 投喂犬神
        feedDog(clickX, clickY);
    }
}

// 揍犬神
function hitDog() {
    // 播放音效
    const hitSound = document.getElementById('hit-sound');
    hitSound.currentTime = 0;
    hitSound.play();
    
    // 显示揍击效果
    dogElement.classList.add('hit');
    setTimeout(() => {
        dogElement.classList.remove('hit');
    }, 100);
    
    // 更新数据（幽灵模式不计入）
    userHits++;
    if (!isGhostMode) {
        totalHits++;
        
        // 更新排行榜（犬神112不计入）
    if (userHits > hitLeader.hits && username !== '犬神112') {
        hitLeader = { name: username, hits: userHits };
    }
        
        // 保存数据
        saveData();
    }
    
    // 更新显示
    updateStats();
    updateLeaderboard();
}

// 投喂犬神
function feedDog(x, y) {
    // 创建肉骨头
    const bone = document.createElement('div');
    bone.className = 'bone';
    bone.textContent = '🦴';
    bone.style.left = `${x - 20}px`;
    bone.style.top = `${y - 20}px`;
    gameArea.appendChild(bone);
    
    // 移除肉骨头
    setTimeout(() => {
        gameArea.removeChild(bone);
    }, 1000);
    
    // 犬神冒心心并移动到肉骨头位置
    dogContainer.classList.add('heart');
    setTimeout(() => {
        dogContainer.classList.remove('heart');
    }, 1000);
    
    // 移动犬神到肉骨头位置
    dogContainer.style.left = `${x - 75}px`;
    dogContainer.style.top = `${y - 75}px`;
    
    // 更新数据（幽灵模式不计入）
    userFeeds++;
    if (!isGhostMode) {
        totalFeeds++;
        
        // 更新排行榜（犬神112不计入）
    if (userFeeds > feedLeader.feeds && username !== '犬神112') {
        feedLeader = { name: username, feeds: userFeeds };
    }
        
        // 保存数据
        saveData();
    }
    
    // 更新显示
    updateStats();
    updateLeaderboard();
}

// 更新统计信息
function updateStats() {
    document.getElementById('total-hits').textContent = totalHits;
    document.getElementById('total-feeds').textContent = totalFeeds;
}

// 更新排行榜
function updateLeaderboard() {
    document.getElementById('hit-leader').textContent = hitLeader.name;
    document.getElementById('feed-leader').textContent = feedLeader.name;
    
    // 更新评价
    if (hitLeader.name !== '暂无') {
        document.getElementById('hit-comment').textContent = `${hitLeader.name}，为什么要这么用力地殴打犬神112！`;
    } else {
        document.getElementById('hit-comment').textContent = '';
    }
    
    if (feedLeader.name !== '暂无') {
        document.getElementById('feed-comment').textContent = `${feedLeader.name}，谢谢你投喂这么多东西！`;
    } else {
        document.getElementById('feed-comment').textContent = '';
    }
}