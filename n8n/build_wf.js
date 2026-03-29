// Build workflow JSON and update via n8n API
const https = require('https');

const wf = {
  name: "NotaireAgent - Generer Acte",
  nodes: [
    {
      parameters: {
        httpMethod: "POST",
        path: "generer-acte",
        responseMode: "lastNode",
        options: {}
      },
      id: "n1",
      name: "Webhook Entree",
      type: "n8n-nodes-base.webhook",
      typeVersion: 2,
      position: [240, 300],
      webhookId: "generer-acte-notariat"
    },
    {
      parameters: {
        method: "GET",
        url: "https://rbujxzyvsftvzyxfifke.supabase.co/rest/v1/profils_cabinets",
        authentication: "predefinedCredentialType",
        nodeCredentialType: "supabaseApi",
        sendQuery: true,
        queryParameters: {
          parameters: [
            {name: "select", value: "cabinet_id,nom_cabinet,plan"},
            {name: "token_api", value: "=eq.{{ $json.body.cabinet_token || $json.headers['x-cabinet-token'] || '' }}"},
            {name: "actif", value: "eq.true"},
            {name: "limit", value: "1"}
          ]
        },
        options: {}
      },
      id: "n2",
      name: "Verifier Cabinet",
      type: "n8n-nodes-base.httpRequest",
      typeVersion: 4.2,
      position: [480, 300],
      credentials: {supabaseApi: {id: "NypE2Sk1Pby9MuUz", name: "Supabase account"}}
    },
    {
      parameters: {
        conditions: {
          options: {caseSensitive: true, leftValue: ""},
          conditions: [{
            id: "check",
            leftValue: "={{ Array.isArray($json) ? $json.length : 0 }}",
            rightValue: 0,
            operator: {type: "number", operation: "gt"}
          }],
          combinator: "and"
        }
      },
      id: "n3",
      name: "Cabinet Valide?",
      type: "n8n-nodes-base.if",
      typeVersion: 2,
      position: [700, 300]
    },
    {
      parameters: {
        method: "POST",
        url: "https://api.anthropic.com/v1/messages",
        authentication: "predefinedCredentialType",
        nodeCredentialType: "anthropicApi",
        sendHeaders: true,
        headerParameters: {
          parameters: [{name: "anthropic-version", value: "2023-06-01"}]
        },
        sendBody: true,
        specifyBody: "json",
        jsonBody: "={{ (() => { const t = $('Webhook Entree').item.json.body.type_acte; const f = $('Webhook Entree').item.json.body.form_data || {}; return JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 2000, system: 'Tu es un assistant notarial expert en droit ivoirien et OHADA. Extrais les informations structurees des documents fournis. Reponds UNIQUEMENT en JSON valide sans markdown. Si une information est illisible ou absente mets null.', messages: [{ role: 'user', content: 'Type acte: ' + t + '. Informations formulaire: ' + JSON.stringify(f) + '. Analyse et extrais toutes les informations pertinentes pour completer cet acte. Reponds en JSON.' }] }); })() }}",
        options: {timeout: 60000}
      },
      id: "n4",
      name: "Extraction Claude",
      type: "n8n-nodes-base.httpRequest",
      typeVersion: 4.2,
      position: [960, 200],
      credentials: {anthropicApi: {id: "ajXSfBIozmvN1PRm", name: "Anthropic account"}}
    },
    {
      parameters: {
        method: "POST",
        url: "https://api.anthropic.com/v1/messages",
        authentication: "predefinedCredentialType",
        nodeCredentialType: "anthropicApi",
        sendHeaders: true,
        headerParameters: {
          parameters: [{name: "anthropic-version", value: "2023-06-01"}]
        },
        sendBody: true,
        specifyBody: "json",
        jsonBody: "={{ (() => { const t = $('Webhook Entree').item.json.body.type_acte; const f = JSON.stringify($('Webhook Entree').item.json.body.form_data || {}); const ext = $('Extraction Claude').item.json.content ? $('Extraction Claude').item.json.content[0].text : '{}'; const cab = Array.isArray($('Verifier Cabinet').item.json) && $('Verifier Cabinet').item.json[0] ? $('Verifier Cabinet').item.json[0].nom_cabinet : 'Etude Notariale'; const d = new Date().toLocaleDateString('fr-FR'); return JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 4000, system: 'Tu es un redacteur d actes notariaux expert en droit ivoirien et OHADA. Regles: 1. Style notarial formel ivoirien 2. References legales articles lois 3. Sections standards 4. [A COMPLETER] si info manquante 5. DRAFT pas definitif', messages: [{ role: 'user', content: 'Redige un acte de ' + t + '. INFORMATIONS DOSSIER: ' + f + '. EXTRAIT DOCUMENTS: ' + ext + '. CABINET: ' + cab + '. DATE: ' + d + '. Genere acte complet professionnel.' }] }); })() }}",
        options: {timeout: 90000}
      },
      id: "n5",
      name: "Generation Acte Claude",
      type: "n8n-nodes-base.httpRequest",
      typeVersion: 4.2,
      position: [1200, 300],
      credentials: {anthropicApi: {id: "ajXSfBIozmvN1PRm", name: "Anthropic account"}}
    },
    {
      parameters: {
        method: "POST",
        url: "http://localhost:8001/generate-word",
        sendBody: true,
        specifyBody: "json",
        jsonBody: "={{ (() => { const t = $('Webhook Entree').item.json.body.type_acte; const txt = $('Generation Acte Claude').item.json.content[0].text; const cab = Array.isArray($('Verifier Cabinet').item.json) && $('Verifier Cabinet').item.json[0] ? $('Verifier Cabinet').item.json[0].nom_cabinet : 'Etude Notariale'; return JSON.stringify({ type_acte: t, texte_acte: txt, cabinet_nom: cab }); })() }}",
        options: {timeout: 30000}
      },
      id: "n6",
      name: "Generer Word",
      type: "n8n-nodes-base.httpRequest",
      typeVersion: 4.2,
      position: [1440, 300]
    },
    {
      parameters: {
        respondWith: "json",
        responseBody: "={{ JSON.stringify({ success: true, filename: $json.filename, docx_base64: $json.docx_base64, avertissement: 'Ce document est un draft genere par IA. Il doit etre valide par le Notaire avant tout usage juridique.' }) }}",
        options: {}
      },
      id: "n7",
      name: "Reponse Succes",
      type: "n8n-nodes-base.respondToWebhook",
      typeVersion: 1.1,
      position: [1680, 300]
    },
    {
      parameters: {
        respondWith: "json",
        responseBody: "={{ JSON.stringify({ success: false, error: 'Cabinet non reconnu ou inactif.' }) }}",
        responseCode: 401,
        options: {}
      },
      id: "n8",
      name: "Erreur 401",
      type: "n8n-nodes-base.respondToWebhook",
      typeVersion: 1.1,
      position: [960, 500]
    }
  ],
  connections: {
    "Webhook Entree": {main: [[{node: "Verifier Cabinet", type: "main", index: 0}]]},
    "Verifier Cabinet": {main: [[{node: "Cabinet Valide?", type: "main", index: 0}]]},
    "Cabinet Valide?": {main: [
      [{node: "Extraction Claude", type: "main", index: 0}],
      [{node: "Erreur 401", type: "main", index: 0}]
    ]},
    "Extraction Claude": {main: [[{node: "Generation Acte Claude", type: "main", index: 0}]]},
    "Generation Acte Claude": {main: [[{node: "Generer Word", type: "main", index: 0}]]},
    "Generer Word": {main: [[{node: "Reponse Succes", type: "main", index: 0}]]}
  },
  settings: {
    executionOrder: "v1",
    saveExecutionProgress: false,
    saveDataSuccessExecution: "none",
    saveDataErrorExecution: "all",
    executionTimeout: 120
  }
};

const body = JSON.stringify(wf);
const options = {
  hostname: "automation.preo-ia.info",
  path: "/api/v1/workflows/3N5gYJJfhPqxFFER",
  method: "PUT",
  headers: {
    "X-N8N-API-KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhMGUxYzdkMS0wMWI1LTRlNTgtYjRiNi0yNWU1MDM1ZWQ3MGQiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiZTZjYTExYTItMzEyOC00M2ZiLWI1ZTktOTEyNWY5ZmFiN2MzIiwiaWF0IjoxNzc0MDA3MDA1LCJleHAiOjE3NzY1NTY4MDB9.IT32k0JU_bnoaGmDWpkLWG0kYs9FYBWjHik18cmPbzQ",
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(body)
  }
};

const req = https.request(options, (res) => {
  let data = "";
  res.on("data", (chunk) => data += chunk);
  res.on("end", () => {
    console.log("Status:", res.statusCode);
    console.log("Raw:", data.substring(0, 1500));
  });
});
req.write(body);
req.end();
