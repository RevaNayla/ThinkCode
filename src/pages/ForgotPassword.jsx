const submit = async (e) => {
  e.preventDefault();

  const res = await api.post("/auth/forgot-password", { email });

  alert(res.data.message);
};
