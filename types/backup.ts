export type BackupHistoricoItem = {
  id: string;
  data: string; // ISO
  tipo: 'backup' | 'restauracao';
  status: 'sucesso' | 'erro';
  mensagem: string;
  log?: string;
}; 