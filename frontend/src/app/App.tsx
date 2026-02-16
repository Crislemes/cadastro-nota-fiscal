import { RouterProvider } from 'react-router';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { Toaster } from 'sonner';
import { router } from './routes';

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <Toaster position="top-right" richColors />
        <RouterProvider router={router} />
      </DataProvider>
    </AuthProvider>
  );
}

export default App;