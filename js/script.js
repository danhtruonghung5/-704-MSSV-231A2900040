/* ===== BÀI 1 ===== */
let index = 0;
let autoSlideInterval;
const slides = document.querySelector('.slides');
const dots = document.querySelectorAll('.dot');

if (slides) {
  const total = slides.children.length;
  
  // Khởi tạo carousel
  function initCarousel() {
    // Bắt đầu tự động chuyển slide
    startAutoSlide();
    
    // Thêm sự kiện cho các nút điều khiển
    document.querySelector('.next').addEventListener('click', () => {
      moveSlide(1);
      resetAutoSlide();
    });
    
    document.querySelector('.prev').addEventListener('click', () => {
      moveSlide(-1);
      resetAutoSlide();
    });
    
    // Thêm sự kiện cho các dot
    dots.forEach(dot => {
      dot.addEventListener('click', (e) => {
        const targetIndex = parseInt(e.target.dataset.index);
        if (targetIndex !== index) {
          index = targetIndex;
          updateCarousel();
          resetAutoSlide();
        }
      });
    });
    
    // Tự động pause khi hover để tiết kiệm tài nguyên
    const carousel = document.querySelector('.carousel');
    carousel.addEventListener('mouseenter', pauseAutoSlide);
    carousel.addEventListener('mouseleave', startAutoSlide);
  }
  
  // Hàm di chuyển slide với xử lý boundary
  function moveSlide(step) {
    // Sử dụng công thức: (index + step + total) % total
    // Điều này đảm bảo index luôn nằm trong khoảng [0, total-1]
    index = (index + step + total) % total;
    updateCarousel();
  }
  
  // Cập nhật giao diện carousel
  function updateCarousel() {
    // Sử dụng transform thay vì thay đổi layout để tối ưu performance
    slides.style.transform = `translateX(-${index * 100}%)`;
    
    // Cập nhật dot active
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
  }
  
  // Tự động chuyển slide
  function startAutoSlide() {
    autoSlideInterval = setInterval(() => {
      moveSlide(1);
    }, 3000); // 3 giây
  }
  
  function pauseAutoSlide() {
    if (autoSlideInterval) {
      clearInterval(autoSlideInterval);
    }
  }
  
  function resetAutoSlide() {
    pauseAutoSlide();
    startAutoSlide();
  }
  
  // Khởi chạy
  initCarousel();
}

/* ===== BÀI 2 ===== */
let todos = JSON.parse(localStorage.getItem('todos')) || [];
let nextId = parseInt(localStorage.getItem('nextId')) || 1;

// Khởi tạo todo list
function initTodo() {
  renderTodo();
  updateStats();
  
  // Hỗ trợ phím Enter
  document.getElementById('todoInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addTodo();
    }
  });
}

// Xử lý mảng state hiệu quả
function renderTodo() {
  const list = document.getElementById('todoList');
  if (!list) return;
  
  // Chỉ render lại khi dữ liệu thay đổi thực sự
  // Sử dụng innerHTML để render toàn bộ danh sách thay vì thao tác DOM từng phần
  list.innerHTML = todos.map(todo => `
    <div class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
      <span class="todo-text">${escapeHtml(todo.text)}</span>
      <button class="complete-btn ${todo.completed ? 'completed' : ''}" 
              onclick="toggleComplete(${todo.id})">
        ${todo.completed ? '✓ Đã xong' : '○ Chưa xong'}
      </button>
      <button class="edit-btn" onclick="editTodo(${todo.id})">✏️ Sửa</button>
      <button class="delete-btn" onclick="deleteTodo(${todo.id})">🗑️ Xóa</button>
    </div>
  `).join('');
}

// Thêm công việc mới
function addTodo() {
  const input = document.getElementById('todoInput');
  const text = input.value.trim();
  
  if (text === '') {
    alert('Vui lòng nhập nội dung công việc!');
    return;
  }
  
  // Xử lý mảng state: thêm phần tử mới vào mảng
  const newTodo = {
    id: nextId++,
    text: text,
    completed: false,
    createdAt: new Date().toLocaleString('vi-VN')
  };
  
  todos.push(newTodo);
  
  // Lưu vào localStorage để dữ liệu bền vững
  saveTodos();
  input.value = '';
  
  // Render lại DOM hiệu quả
  renderTodo();
  updateStats();
}

// Xóa công việc
function deleteTodo(id) {
  // Xử lý mảng state: lọc ra phần tử cần xóa
  todos = todos.filter(todo => todo.id !== id);
  saveTodos();
  
  // Render lại DOM hiệu quả
  renderTodo();
  updateStats();
}

// Sửa công việc
function editTodo(id) {
  const todo = todos.find(t => t.id === id);
  if (!todo) return;
  
  const newText = prompt('Sửa công việc:', todo.text);
  if (newText !== null && newText.trim() !== '') {
    // Xử lý mảng state: cập nhật phần tử
    todo.text = newText.trim();
    saveTodos();
    
    // Render lại DOM hiệu quả
    renderTodo();
  }
}

// Đánh dấu hoàn thành
function toggleComplete(id) {
  const todo = todos.find(t => t.id === id);
  if (!todo) return;
  
  // Xử lý mảng state: cập nhật trạng thái
  todo.completed = !todo.completed;
  saveTodos();
  
  // Render lại DOM hiệu quả
  renderTodo();
  updateStats();
}

// Xóa các công việc đã hoàn thành
function clearCompleted() {
  // Xử lý mảng state: lọc ra các phần tử chưa hoàn thành
  todos = todos.filter(todo => !todo.completed);
  saveTodos();
  
  // Render lại DOM hiệu quả
  renderTodo();
  updateStats();
}

// Xóa tất cả công việc
function clearAll() {
  if (confirm('Bạn có chắc chắn muốn xóa tất cả công việc?')) {
    todos = [];
    saveTodos();
    
    // Render lại DOM hiệu quả
    renderTodo();
    updateStats();
  }
}

// Cập nhật thống kê
function updateStats() {
  const total = todos.length;
  const completed = todos.filter(todo => todo.completed).length;
  
  const totalEl = document.getElementById('totalTasks');
  const completedEl = document.getElementById('completedTasks');
  
  if (totalEl) totalEl.textContent = `Tổng cộng: ${total}`;
  if (completedEl) completedEl.textContent = `Hoàn thành: ${completed}`;
}

// Lưu dữ liệu vào localStorage
function saveTodos() {
  localStorage.setItem('todos', JSON.stringify(todos));
  localStorage.setItem('nextId', nextId.toString());
}

// Escape HTML để tránh XSS
function escapeHtml(text) {
  return text
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, '&#039;');
}

// Khởi chạy
initTodo();

/* ===== BÀI 3 ===== */
let secret = Math.floor(Math.random() * 100) + 1;
let count = 0;
let gameActive = true;
const fireworksContainer = document.querySelector('.fireworks-container');

function checkGuess() {
  if (!gameActive) return;
  
  const input = document.getElementById('guess');
  const result = document.getElementById('result');
  const countDisplay = document.getElementById('count');
  const hint = document.getElementById('hint');
  
  // Xử lý nhập để tránh lỗi
  const guessStr = input.value.trim();
  
  // Kiểm tra giá trị rỗng
  if (guessStr === '') {
    result.textContent = "⚠️ Vui lòng nhập số!";
    result.style.color = "#e74c3c";
    return;
  }
  
  // Chuyển đổi sang số nguyên
  const guess = Number(guessStr);
  
  // Kiểm tra có phải số hợp lệ
  if (isNaN(guess) || !Number.isInteger(guess)) {
    result.textContent = "⚠️ Vui lòng nhập số nguyên!";
    result.style.color = "#e74c3c";
    return;
  }
  
  // Kiểm tra phạm vi hợp lệ
  if (guess < 1 || guess > 100) {
    result.textContent = "⚠️ Số phải trong khoảng 1-100!";
    result.style.color = "#e74c3c";
    return;
  }
  
  count++;
  countDisplay.textContent = `Lần thử: ${count}`;
  
  // So sánh và xử lý kết quả
  if (guess > secret) {
    result.textContent = "📈 Quá cao!";
    result.style.color = "#e74c3c";
    hint.textContent = "Hãy thử số nhỏ hơn";
    hint.style.color = "#e74c3c";
  } else if (guess < secret) {
    result.textContent = "📉 Quá thấp!";
    result.style.color = "#3498db";
    hint.textContent = "Hãy thử số lớn hơn";
    hint.style.color = "#3498db";
  } else {
    result.textContent = "🎉 CHÍNH XÁC!";
    result.style.color = "#27ae60";
    hint.textContent = `Chúc mừng! Bạn đã đoán đúng sau ${count} lần thử.`;
    hint.style.color = "#27ae60";
    gameActive = false;
    input.disabled = true;
    triggerFireworks();
  }
  
  // Focus lại input để tiếp tục chơi
  input.focus();
}

function resetGame() {
  secret = Math.floor(Math.random() * 100) + 1;
  count = 0;
  gameActive = true;
  
  document.getElementById('result').textContent = "";
  document.getElementById('count').textContent = "";
  document.getElementById('hint').textContent = "";
  document.getElementById('guess').value = "";
  document.getElementById('guess').disabled = false;
  
  // Dừng pháo hoa
  if (fireworksContainer) {
    fireworksContainer.classList.remove('active');
    fireworksContainer.innerHTML = '';
  }
}

// Tạo hiệu ứng pháo hoa CSS
function triggerFireworks() {
  if (!fireworksContainer) return;
  
  fireworksContainer.classList.add('active');
  
  // Tạo nhiều particle pháo hoa
  for (let i = 0; i < 50; i++) {
    const firework = document.createElement('div');
    firework.className = 'firework';
    
    // Màu ngẫu nhiên
    const colors = ['#e74c3c', '#f1c40f', '#3498db', '#9b59b6', '#2ecc71', '#e67e22'];
    firework.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    
    // Vị trí ngẫu nhiên
    const startX = Math.random() * 100;
    const startY = Math.random() * 100;
    firework.style.left = `${startX}%`;
    firework.style.top = `${startY}%`;
    
    // Hướng nổ ngẫu nhiên
    const angle = Math.random() * Math.PI * 2;
    const distance = 50 + Math.random() * 100;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance;
    
    firework.style.setProperty('--tx', `${tx}px`);
    firework.style.setProperty('--ty', `${ty}px`);
    
    fireworksContainer.appendChild(firework);
    
    // Xóa particle sau khi animation xong
    setTimeout(() => {
      firework.remove();
    }, 1000);
  }
  
  // Tắt hiệu ứng sau 3 giây
  setTimeout(() => {
    fireworksContainer.classList.remove('active');
  }, 3000);
}

// Hỗ trợ phím Enter
document.getElementById('guess').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    checkGuess();
  }
});
