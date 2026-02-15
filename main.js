const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let backendProcess;

// Remover menu padrão
Menu.setApplicationMenu(null);

// Iniciar backend
function startBackend() {
  const isDev = !app.isPackaged;
  const backendPath = isDev
    ? path.join(__dirname, 'backend', 'server.js')
    : path.join(process.resourcesPath, 'backend', 'server.js');

  backendProcess = spawn('node', [backendPath], {
    env: { 
      ...process.env, 
      PORT: '3001',
      PORTABLE_EXECUTABLE_DIR: app.getPath('userData')
    }
  });

  backendProcess.stdout.on('data', (data) => {
    console.log(`Backend: ${data}`);
  });

  backendProcess.stderr.on('data', (data) => {
    console.error(`Backend Error: ${data}`);
  });
}

// Criar janela
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    },
    icon: path.join(__dirname, 'build', 'icon.png'),
    autoHideMenuBar: true
  });

  // Remover menu da janela
  mainWindow.setMenu(null);

  const isDev = !app.isPackaged;
  
  if (isDev) {
    // Desenvolvimento: aguardar backend e carregar do Vite
    setTimeout(() => {
      mainWindow.loadURL('http://localhost:5173');
      mainWindow.webContents.openDevTools();
    }, 2000);
  } else {
    // Produção: carregar build estático
    mainWindow.loadFile(path.join(__dirname, 'frontend', 'dist', 'index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  startBackend();
  
  // Aguardar backend iniciar
  setTimeout(() => {
    createWindow();
  }, 1000);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (backendProcess) {
    backendProcess.kill();
  }
  app.quit();
});

app.on('before-quit', () => {
  if (backendProcess) {
    backendProcess.kill();
  }
});
