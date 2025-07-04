export type AppRoutes = 
  | '/'
  | '/auth/login'
  | '/auth/register'
  | '/setup'
  | '/setup/profile'
  | '/setup/vehicle'
  | '/agenda'
  | '/agenda/novo'
  | '/jornada/iniciar'
  | '/jornada/finalizar'
  | '/financas'
  | '/financas/nova-transacao'
  | '/financas/editar/[id]'
  | '/relatorios/resumo'
  | '/configuracoes/perfil'
  | '/configuracoes/veiculo'
  | '/configuracoes/notificacoes'
  | '/configuracoes/privacidade'
  | '/combustivel'
  | '/combustivel/novo'
  | '/combustivel/historico'
  | '/combustivel/postos'
  | '/combustivel/posto/[id]'; 