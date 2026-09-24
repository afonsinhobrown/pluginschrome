# DOCUMENTO DE IMPLEMENTAÇÃO — EXTENSÃO GOOGLE CHROME
## TECNOINCUBADORA

---

## 1. OBJETIVO

Extensão Chrome (Manifest V3) que se integra com a API central TECNOINCUBADORA, sem acesso direto à base de dados.

---

## 2. STACK TÉCNICA

- **Manifest:** V3 (obrigatório — V2 descontinuado)
- **Frontend da extensão:** HTML/CSS/JS ou React (build via Vite/Webpack)
- **Comunicação:** fetch/axios via HTTPS para API própria
- **Autenticação:** JWT ou API key, armazenado em `chrome.storage.local` (nunca em localStorage da página)

---

## 3. ESTRUTURA DE FICHEIROS

```
extension/
  manifest.json
  src/
    popup/
      popup.html
      popup.js
      popup.css
    background/
      background.js       (service worker)
    content/
      content.js           (injeta na página, se necessário)
    lib/
      api.js                (wrapper de chamadas à API)
      auth.js                (gestão de token)
  icons/
    icon16.png
    icon48.png
    icon128.png
```

---

## 4. MANIFEST.JSON — CAMPOS OBRIGATÓRIOS

```json
{
  "manifest_version": 3,
  "name": "Nome da extensão",
  "version": "1.0.0",
  "permissions": ["storage", "activeTab"],
  "host_permissions": ["https://api.tecnoincubadora.com/*"],
  "background": { "service_worker": "src/background/background.js" },
  "action": { "default_popup": "src/popup/popup.html" },
  "icons": { "16": "icons/icon16.png", "48": "icons/icon48.png", "128": "icons/icon128.png" }
}
```
Ajustar `permissions` e `host_permissions` ao mínimo necessário — Chrome Web Store rejeita permissões excessivas não justificadas.

---

## 5. ARQUITETURA DE INTEGRAÇÃO

```
Extensão (JS) → HTTPS + token → API REST (Node.js/Express) → Base de dados (Neon)
```

**Regras obrigatórias:**
- Extensão NUNCA liga diretamente à base de dados
- Toda credencial sensível fica no backend, não no código da extensão (código da extensão é inspecionável publicamente)
- Autenticação via token de curta duração, renovado pela API
- CORS na API restrito à origem da extensão (`chrome-extension://<ID>`)

---

## 6. FLUXO DE AUTENTICAÇÃO

1. Utilizador faz login no popup (formulário ou OAuth)
2. Popup envia credenciais para `POST /api/auth/login`
3. API valida e devolve JWT
4. Extensão guarda JWT em `chrome.storage.local`
5. Toda chamada seguinte inclui `Authorization: Bearer <token>`
6. Background service worker trata renovação/expiração de token

---

## 7. ORDEM DE DESENVOLVIMENTO

1. Setup do manifest + estrutura de pastas
2. Popup básico (UI mínima funcional)
3. Módulo de autenticação (`auth.js`) + fluxo de login
4. Módulo de API (`api.js`) — wrapper de todas as chamadas
5. Funcionalidade principal (scraping/automação/assistente — conforme o caso de uso)
6. Content script (se precisar de interagir com páginas de terceiros)
7. Testes manuais em `chrome://extensions` (modo developer, load unpacked)
8. Build de produção + preparação de assets para Chrome Web Store

---

## 8. PUBLICAÇÃO

- Conta de developer: $5 (pagamento único)
- Chrome Web Store Developer Dashboard: upload do `.zip` do build
- Requisitos: ícones (16/48/128px), screenshots, descrição, política de privacidade (obrigatória se recolher dados)
- Tempo de revisão: normalmente 1-3 dias

---

## 9. ENTREGÁVEL ESPERADO DO AGENTE

- Extensão funcional carregável via "load unpacked"
- Autenticação integrada com a API TECNOINCUBADORA
- Funcionalidade principal implementada e testável
- Build de produção pronto para submissão à Chrome Web Store
