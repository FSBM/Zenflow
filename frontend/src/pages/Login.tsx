import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FolderKanban } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { request } from '@/lib/api';
import { setToken, setUser } from '@/lib/auth';
import { useLoading } from '@/components/LoadingProvider';

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { showLoading, hideLoading } = useLoading();

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({ name: "", email: "", password: "" });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    showLoading();
    try {
      // basic client-side validation to avoid obvious 400s
      if (!loginData.email || !loginData.password) {
        toast({ title: 'Validation', description: 'Email and password are required' });
        setIsLoading(false);
        return;
      }

      const resAny = await request('/api/auth/login', { method: 'POST', body: loginData }) as any;
      if (resAny?.token) {
        setToken(resAny.token);
        setUser(resAny.user);
        toast({ title: 'Login successful', description: resAny.message || 'Welcome back!' });
        navigate('/home');
      } else {
        toast({ title: 'Login failed', description: 'Invalid response from server' });
      }
    } catch (err: any) {
      console.error(err);
      // Try to extract detailed validation errors from the API error payload
      const details = err?.details;
      let desc = err?.message || 'Unknown error';
      if (details) {
        if (typeof details === 'string') desc = details;
        else if (details.message) desc = details.message;
        else if (Array.isArray(details.errors) && details.errors.length > 0) {
          desc = details.errors.map((d: any) => d.msg || d.message).join('; ');
        }
      }
      toast({ title: 'Login failed', description: desc });
    } finally {
      setIsLoading(false);
      hideLoading();
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    showLoading();
    try {
      const resAny = await request('/api/auth/register', { method: 'POST', body: registerData }) as any;
      if (resAny?.token) {
        setToken(resAny.token);
        setUser(resAny.user);
        toast({ title: 'Account created', description: resAny.message || 'Your account has been created' });
        navigate('/home');
      } else {
        toast({ title: 'Registration failed', description: 'Invalid response from server' });
      }
    } catch (err: any) {
      console.error(err);
      toast({ title: 'Registration failed', description: err?.details?.message || err?.message || 'Unknown error' });
    } finally {
      setIsLoading(false);
      hideLoading();
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center space-y-2">
          <img src="/zenflow.svg" alt="zenflow" className="h-12 w-12" />
          <h1 className="text-3xl font-bold tracking-tight">zenflow</h1>
          <p className="text-sm text-muted-foreground">Manage your projects with ease</p>
        </div>

        {/* Auth Card */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Welcome</CardTitle>
            <CardDescription>Sign in to your account or create a new one</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="you@example.com"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign in"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name">Name</Label>
                    <Input
                      id="register-name"
                      type="text"
                      placeholder="John Doe"
                      value={registerData.name}
                      onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="you@example.com"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="••••••••"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Creating account..." : "Create account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
