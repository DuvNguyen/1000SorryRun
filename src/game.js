const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// 📌 Set kích thước canvas theo iPhone 11 ngang
canvas.width = 1792;
canvas.height = 828;


// Kích thước canvas
canvas.width = 830;
canvas.height = 400;

// Load ảnh nền
const bgImage = new Image();
bgImage.src = "assets/background.png";

// Load nhân vật (sprite sheet)
const playerImage = new Image();
playerImage.src = "assets/run.png";

// load ảnh công chúa
let princessImg = new Image();
princessImg.src = "assets/princess.png";

// Load chướng ngại vật
const obstacleImage = new Image();
obstacleImage.src = "assets/Idle.png";

// Biến trạng thái game
let gameOver = false;

// Biến tần suất xuất hiện bẫy
let obstacleSpawnRate = 3000; // tần suất ban đầu là 3 giây một phát
const minSpawnRate = 700; // tần suất nhiều nhất là 1 giây một phát

// Biến tốc độ chạy của bẫy
let obstacleSpeed = 3;
const maxObstacleSpeed = 5;

// Biến thắng game
let gameWon = false;

// Thông tin về nhân vật
const player = {
    x: 100,
    y: canvas.height - 40,
    width: 32,
    height: 32,
    frameX: 0,
    frameY: 0,
    speed: 5,
    jumping: false,
    velocityY: 0,
    gravity: 0.4
};

let princess = {
    x: (canvas.width - 40) / 2, // Ở giữa màn hình
    y: canvas.height - 40, // Cùng độ cao với nhân vật chính
    width: 40,
    height: 40,
    frameX: 0,
    frameY: 0,
    visible: false
};


// Hiệu ứng cuộn nền
let bgX1 = 0;
let bgX2 = canvas.width;
const bgSpeed = 2;

// Điều chỉnh tốc độ animation
let frameIndex = 0;   
let frameDelay = 12;  
let frameCounter = 0; 

// Mảng chứa chướng ngại vật
const obstacles = [];

// Tạo chướng ngại vật ngẫu nhiên
function spawnObstacle() {
    if (gameOver) return;

    const obstacle = {
        x: canvas.width,
        y: canvas.height - 40,
        width: 32,
        height: 32,
        speed: obstacleSpeed
    };
    obstacles.push(obstacle);

    setTimeout(spawnObstacle, Math.random() * obstacleSpawnRate + obstacleSpawnRate); 
}


// chỗ này mình sẽ viết tính điểm
let score = 0;

// mình viết thêm hàm cập nhật điểm theo thời gian nè
function updateScore(){
    if(!gameOver){
        score++;
        
        setTimeout(updateScore, 100) // 100ms thì tăng một điểm
        
        // tăng tần suất xuất hiện bẫy lên, nhớ reset tần suất ở hàm restart
        if(score % 10  === 0 && obstacleSpawnRate > minSpawnRate){
            obstacleSpawnRate -= 200;
            console.log("Tốc độ bẫy tăng, thời gian hiện tại: ", obstacleSpawnRate);
        }
    }
}

// Hàm cập nhật tốc độ chướng ngại vật dựa trên điểm số
function updateObstacleSpeed() {
    obstacleSpeed = 3 + Math.floor(score / 100); // Cứ mỗi 10 điểm, tốc độ tăng 1 đơn vị
}


// Kiểm tra va chạm
// 📌 Điều chỉnh hitbox nhân vật và chướng ngại vật
function checkCollision(player, obstacle) {
    let playerHitbox = {
        x: player.x + 5,   // Bớt 5px rìa trái
        y: player.y + 5,   // Bớt 5px rìa trên
        width: player.width - 10,  // Giảm kích thước hitbox
        height: player.height - 10
    };

    let obstacleHitbox = {
        x: obstacle.x + 5,   // Lùi hitbox vào trong
        y: obstacle.y + (obstacle.height / 2), // Chỉ tính va chạm phần trên của gai
        width: obstacle.width - 10,
        height: obstacle.height / 2 // Chỉ lấy nửa trên để tránh lỗi
    };

    return (
        playerHitbox.x < obstacleHitbox.x + obstacleHitbox.width &&
        playerHitbox.x + playerHitbox.width > obstacleHitbox.x &&
        playerHitbox.y < obstacleHitbox.y + obstacleHitbox.height &&
        playerHitbox.y + playerHitbox.height > obstacleHitbox.y
    );
}


function showWinMessage() {
    ctx.fillStyle = "black"; // Màu nâu giống mực viết thư
    ctx.font = "20px 'Courier New', 'Times New Roman', serif"; // Chữ thư pháp
    ctx.textAlign = "center"; // Căn giữa
    
    let message = [
        "Chúc mừng bạn đã đưa ếch tèo đến nơi anh ấy cần đến!",
        "Bạn đã vượt qua mọi thử thách",
        "và giúp anh ấy gặp được người thương của mình.",
        "Hành trình đã kết thúc,",
        "nhưng tình yêu còn mãi.",
        "Ếch xin lỗi vì đã khiến công chúa hay buồn nha",
        "Game thì cùi bắp nhưng tình cảm của ếch tèo thì tuyệt vời",
        "ếch tèo gửi lời cảm ơn đến em!", 
        "vì người ếch yêu là một cô gái mạnh mẽ! "
    ];

    let x = canvas.width / 2;
    let y = canvas.height / 2 - 50;

    // Vẽ từng dòng chữ
    message.forEach((line, index) => {
        ctx.fillText(line, x, y + index * 20);
    });
}


// Cập nhật game
function update() {

    if (score >= 1000 && !gameWon) {
        gameWon = true;
        gameOver = true; // Dừng game chính
        princess.visible = true;
        princess.y = player.y; // Cùng độ cao với nhân vật
        winGameLoop(); // Chuyển sang loop thắng game
        return;
    }
    

    if (gameOver) return;

    // Di chuyển nền
    bgX1 -= bgSpeed;
    bgX2 -= bgSpeed;

    if (bgX1 + canvas.width <= 0) bgX1 = bgX2 + canvas.width;
    if (bgX2 + canvas.width <= 0) bgX2 = bgX1 + canvas.width;

    // Cập nhật nhảy
    if (player.jumping) {
        player.y += player.velocityY;
        player.velocityY += player.gravity;
        if (player.y >= canvas.height - 40) {
            player.y = canvas.height - 40;
            player.jumping = false;
        }
    }

    // Cập nhật animation
    frameCounter++;
    if (frameCounter >= frameDelay) {
        player.frameX = (player.frameX + 1) % 6;
        frameCounter = 0;
    }

    // cập nhật tốc độ chướng ngại vật
    updateObstacleSpeed();

    // Cập nhật chướng ngại vật
    for (let i = 0; i < obstacles.length; i++) {
        obstacles[i].x -= obstacles[i].speed;

        // Kiểm tra va chạm
        if (checkCollision(player, obstacles[i])) {
            gameOver = true;
            console.log("💥 Game Over!");

            setTimeout(() => {
                ctx.fillStyle = "#B68D40";  // Màu nâu vàng dịu
                ctx.font = "28px 'Baloo 2', sans-serif";
                ctx.textAlign = "center";
                
                // Hiển thị "Game Over"
                ctx.fillText("Ròi xongg, ngỏm luôn", canvas.width / 2, canvas.height / 2);
            
                // Hiển thị hướng dẫn chơi lại
                ctx.font = "20px 'Baloo 2', sans-serif";  // Chữ nhỏ hơn
                ctx.fillStyle = "#D9A066";  // Màu sáng hơn chút
                ctx.fillText("Chạm màn hình để chơi lại", canvas.width / 2, canvas.height / 2 + 40);
            }, 100);
            
            return;
        }
    }

    // Xóa chướng ngại vật khi ra khỏi màn hình
    while (obstacles.length > 0 && obstacles[0].x + obstacles[0].width < 0) {
        obstacles.shift();
    }
}

// vẽ điểm
function drawScore() {
    ctx.fillStyle = "black"; // Màu vàng đậm
    ctx.font = "24px 'Baloo 2', sans-serif";
    ctx.textAlign = "left";  // Canh trái
    ctx.fillText(`Điểm: ${score}`, 20, 30);  // Đặt vị trí gần góc trái trên cùng
}

// hàm vẽ công chúa
function drawPrincess() {
    if (princess.visible) {
        ctx.save();
        ctx.translate(princess.x + princess.width, princess.y); // Di chuyển hệ trục đến vị trí công chúa
        ctx.scale(-1, 1); // Lật ngược công chúa
        
        ctx.drawImage(
            princessImg,
            princess.frameX * 32, // Đảm bảo lấy đúng frame 32x32
            princess.frameY * 32,
            32, 32, // Kích thước frame
            -princess.width, 0, // Điều chỉnh vị trí do đã lật
            32, 32 // Vẽ với kích thước 32x32
        );

        ctx.restore();
    }
}






// Vẽ game
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Vẽ nền
    ctx.drawImage(bgImage, bgX1, 0, canvas.width, canvas.height);
    ctx.drawImage(bgImage, bgX2, 0, canvas.width, canvas.height);

    // Vẽ nhân vật
    ctx.drawImage(
        playerImage,
        player.frameX * player.width,
        player.frameY * player.height,
        player.width,
        player.height,
        player.x,
        player.y,
        player.width,
        player.height
    );
    

    // Vẽ chướng ngại vật
    for (let obstacle of obstacles) {
        ctx.drawImage(obstacleImage, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    }
    
    // vẽ điểm
    drawScore()
}

// Xử lý nhảy
function jump() {
    if (!player.jumping) {
        player.jumping = true;
        player.velocityY = -10;
    }
}

// Xử lý chạm màn hình (cho điện thoại)
function handleTouch() {
    if (gameOver) {
        restartGame(); // Nếu game over, chạm để chơi lại
    } else {
        jump(); // Nếu đang chơi, chạm để nhảy
    }
}

// Restart game
function restartGame() {
    gameOver = false;
    player.y = canvas.height - 40;
    player.jumping = false;
    player.velocityY = 0;
    player.frameX = 0;
    obstacles.length = 0; // Xóa hết chướng ngại vật
    score = 0; // Cập nhật lại điểm
    obstacleSpawnRate = 3000;   
    spawnObstacle(); // Bắt đầu lại chướng ngại vật
    updateScore();
    gameLoop(); // Chạy lại game
}


document.addEventListener("keydown", (event) => {
    if (event.code === "Space") {
        handleTouch();
    }
});

// Xử lý chạm màn hình cho điện thoại
canvas.addEventListener("touchstart", handleTouch);



// hàm show menu game
function showGameMenu() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Vẽ nền
    ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);

    // Cốt truyện (căn lề trái)
    ctx.fillStyle = "#5C4033"; // Màu nâu giống thư tay
    ctx.font = "22px 'Courier New', 'Times New Roman', serif";
    ctx.textAlign = "left"; // Căn lề trái

    let story = [
        "Ngày xưa, có một chàng trai dũng cảm,",
        "trải qua bao khó khăn để tìm về người thương.",
        "Trên con đường ấy, cậu phải vượt qua",
        "biết bao chướng ngại và thử thách...",
        "",
        "Liệu cậu có thể về đến nơi?",
        "Hành trình bắt đầu từ đây!"
    ];

    let x = 50; // Căn lề trái
    let y = canvas.height / 3;

    // Vẽ từng dòng chữ
    story.forEach((line, index) => {
        ctx.fillText(line, x, y + index * 30);
    });

    // Thông báo bắt đầu game
    ctx.font = "24px Arial";
    ctx.fillStyle = "#D32F2F"; // Màu đỏ nổi bật
    ctx.textAlign = "center";
    ctx.fillText("Nhấn vào màn hình để chơi!", canvas.width / 2, canvas.height - 50);

    // Thêm sự kiện bắt đầu game
    canvas.addEventListener("click", startGame, { once: true });
}


// Vòng lặp win game
function winGameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Vẽ nền
    ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);

    // Vẽ công chúa ở giữa màn hình
    princess.x = (canvas.width - princess.width) / 2;
    drawPrincess();

    // Vẽ nhân vật
    ctx.drawImage(
        playerImage,
        player.frameX * player.width,
        player.frameY * player.height,
        player.width,
        player.height,
        player.x,
        player.y,
        player.width,
        player.height
    );

    // Nếu nhân vật chưa đến công chúa, tiếp tục di chuyển
    if (player.x < princess.x - player.width / 2) {
        player.x += 1; // Điều chỉnh tốc độ chạy
        requestAnimationFrame(winGameLoop);
    } else {
        showWinMessage(); // Hiển thị thông báo thắng
    }
}

// // Hàm game loop
// function gameLoop() {
//     if (!gameOver) {
//         update();
//         draw();
//         requestAnimationFrame(gameLoop);
//     }
// }


// // Bắt đầu game
// updateScore();
// bgImage.onload = function() {
//     spawnObstacle();
//     gameLoop();
// };

// Biến kiểm tra trạng thái game
let gameStarted = false;

// Hàm hiển thị cốt truyện
// Hàm hiển thị cốt truyện (căn giữa)
function drawStoryText() {
    ctx.fillStyle = "black"; // Màu nâu giống thư tay
    ctx.font = "20px 'Courier New', 'Times New Roman', serif";
    ctx.textAlign = "center"; // Căn giữa theo chiều ngang

    let story = [
        "Ngày xưa, có một chàng trai yêu một cô gái,",
        "Một ngày trong lúc chia xa,",
        "chàng đã khiến cho người mình yêu phải buồn",
        "Như chịu hậu quả, chàng bị biến thành con ếch",
        "bị đem đến nơi xa tít mù khơi",
        "Bạn hãy giúp cậu ấy vượt ngàn chông gai.",
        "Bằng cách vượt 1000 điểm để về bên công chúa",
        "và dành một lời xin lỗi chân thành nhất...",
        "Liệu anh ấy có thể vượt qua được hết chông gai?",
        "Điều đó là nhờ bạn! "
    ];

    let x = canvas.width / 2; // Căn giữa màn hình
    let y = canvas.height / 8; // Bắt đầu từ 1/3 màn hình

    // Vẽ từng dòng chữ của cốt truyện
    story.forEach((line, index) => {
        ctx.fillText(line, x, y + index * 30);
    });

    // Thông báo bắt đầu game
    ctx.font = "24px Arial";
    ctx.fillStyle = "#D32F2F"; // Màu đỏ nổi bật
    ctx.fillText("Nhấn vào màn hình để bắt đầu!", canvas.width / 2, canvas.height - 33);
}



// Hàm hiển thị menu game
function showGameMenu() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Vẽ nền
    ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);

    drawStoryText();
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// Gọi khi trang tải hoặc thay đổi kích thước màn hình
window.addEventListener("resize", resizeCanvas);
resizeCanvas(); // Chạy ngay khi game khởi động


// Hàm bắt đầu game
function startGame() {
    if (!gameStarted) {
        gameStarted = true;
        spawnObstacle(); // Bắt đầu tạo chướng ngại vật
        gameLoop(); // Chạy game

        // Xóa sự kiện sau khi game đã bắt đầu
        canvas.removeEventListener("click", startGame);
        canvas.removeEventListener("touchstart", startGame);
    }
}

// Hàm game loop
function gameLoop() {
    if (!gameOver) {
        update();
        draw();
        requestAnimationFrame(gameLoop);
    }
}

// Bắt đầu bằng menu game trước
updateScore();
bgImage.onload = function() {
    showGameMenu(); // Hiển thị menu trước
};

// Lắng nghe sự kiện click (PC) & touch (Mobile) để bắt đầu game
canvas.addEventListener("click", startGame);
canvas.addEventListener("touchstart", startGame);

