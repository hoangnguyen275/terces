function App() {
  const response = await axios.post("/api/auth/signin", {
    username,
    password,
  });

  const accessToken = response.data.accessToken;
  return <>hello</>;
}

export default App;
