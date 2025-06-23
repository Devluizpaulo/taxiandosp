# Regras de Segurança do Firestore

## Regra Principal
```js
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```
- Usuários só podem acessar seus próprios dados.
- Subcoleções podem ter regras mais granulares se necessário.

## Exemplos de Expansão
- Permitir leitura pública de uma subcoleção:
```js
match /users/{userId}/publicos/{docId} {
  allow read: if true;
  allow write: if request.auth.uid == userId;
}
```

## Índices Necessários
- Para queries filtrando por múltiplos campos (ex: `where('veiculoLocadoId', '==', ...)` e `orderBy('data', 'desc')`), crie índices compostos no console do Firebase.
- Documente queries que exigem índices no README ou aqui.

## Boas Práticas
- Sempre valide o `request.auth.uid`.
- Restrinja permissões ao mínimo necessário.
- Teste as regras usando o simulador do Firebase. 