const https = require('https');

// V3: Simplified - no Code nodes for data prep, use Set nodes instead
// Use Anthropic Chat Model native node for generation
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
      id: "w1",
      name: "Webhook",
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
      id: "w2",
      name: "Supabase Cabinet",
      type: "n8n-nodes-base.httpRequest",
      typeVersion: 4.2,
      position: [460, 300],
      credentials: {supabaseApi: {id: "NypE2Sk1Pby9MuUz", name: "Supabase account"}}
    },
    {
      parameters: {
        assignments: {
          assignments: [
            {
              id: "a1",
              name: "type_acte",
              value: "={{ $('Webhook').item.json.body.type_acte }}",
              type: "string"
            },
            {
              id: "a2",
              name: "form_data",
              value: "={{ JSON.stringify($('Webhook').item.json.body.form_data || {}) }}",
              type: "string"
            },
            {
              id: "a3",
              name: "nom_cabinet",
              value: "={{ $json.nom_cabinet || 'Etude Notariale' }}",
              type: "string"
            },
            {
              id: "a4",
              name: "cabinet_id",
              value: "={{ $json.cabinet_id || '' }}",
              type: "string"
            },
            {
              id: "a5",
              name: "cabinet_found",
              value: "={{ $json.cabinet_id ? 'yes' : 'no' }}",
              type: "string"
            }
          ]
        },
        options: {}
      },
      id: "w3",
      name: "Set Variables",
      type: "n8n-nodes-base.set",
      typeVersion: 3.4,
      position: [680, 300]
    },
    {
      parameters: {
        conditions: {
          options: {caseSensitive: true, leftValue: ""},
          conditions: [{
            id: "c1",
            leftValue: "={{ $json.cabinet_found }}",
            rightValue: "yes",
            operator: {type: "string", operation: "equals"}
          }],
          combinator: "and"
        }
      },
      id: "w4",
      name: "Cabinet OK?",
      type: "n8n-nodes-base.if",
      typeVersion: 2,
      position: [900, 300]
    },
    {
      parameters: {
        method: "POST",
        url: "https://api.anthropic.com/v1/messages",
        sendHeaders: true,
        headerParameters: {
          parameters: [
            {name: "x-api-key", value: "YOUR_ANTHROPIC_API_KEY"},
            {name: "anthropic-version", value: "2023-06-01"},
            {name: "content-type", value: "application/json"}
          ]
        },
        sendBody: true,
        specifyBody: "json",
        jsonBody: '={{ JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 4000, system: "Tu es un redacteur d actes notariaux expert en droit ivoirien et OHADA. Regles absolues: 1. Style notarial formel ivoirien 2. References legales articles et lois 3. Sections standards du droit notarial 4. Utiliser [A COMPLETER] si info manquante 5. Ne jamais utiliser le mot draft ou DRAFT 6. Ne pas utiliser de syntaxe markdown (## ** -- etc) 7. Rediger en texte pur style notarial 8. Titres de sections en MAJUSCULES sans symboles 9. Aucun avertissement ni note de bas de document 10. Ne pas mentionner que le document est genere par IA", messages: [{ role: "user", content: "Redige un acte de " + $json.type_acte + ". INFORMATIONS DU DOSSIER: " + $json.form_data + ". CABINET: " + $json.nom_cabinet + ". DATE: " + new Date().toLocaleDateString("fr-FR") + ". Genere l acte complet et professionnel." }] }) }}',
        options: {timeout: 90000}
      },
      id: "w5",
      name: "Claude Generation",
      type: "n8n-nodes-base.httpRequest",
      typeVersion: 4.2,
      position: [1140, 200],
      credentials: {}
    },
    {
      parameters: {
        method: "POST",
        url: "http://161.97.181.171:8001/generate-word",
        sendBody: true,
        specifyBody: "json",
        jsonBody: '={{ JSON.stringify({ type_acte: $("Set Variables").item.json.type_acte, texte_acte: $json.content[0].text, cabinet_nom: $("Set Variables").item.json.nom_cabinet }) }}',
        options: {timeout: 30000}
      },
      id: "w6",
      name: "Generer Word",
      type: "n8n-nodes-base.httpRequest",
      typeVersion: 4.2,
      position: [1380, 200]
    },
    {
      parameters: {
        assignments: {
          assignments: [
            {
              id: "r1",
              name: "success",
              value: true,
              type: "boolean"
            },
            {
              id: "r2",
              name: "filename",
              value: "={{ $json.filename }}",
              type: "string"
            },
            {
              id: "r3",
              name: "docx_base64",
              value: "={{ $json.docx_base64 }}",
              type: "string"
            },
            {
              id: "r4",
              name: "avertissement",
              value: "Ce document est un draft genere par IA. Il doit etre valide par le Notaire avant tout usage juridique.",
              type: "string"
            }
          ]
        },
        options: {}
      },
      id: "w7",
      name: "Reponse OK",
      type: "n8n-nodes-base.set",
      typeVersion: 3.4,
      position: [1620, 200]
    },
    {
      parameters: {
        assignments: {
          assignments: [
            {
              id: "e1",
              name: "success",
              value: false,
              type: "boolean"
            },
            {
              id: "e2",
              name: "error",
              value: "Cabinet non reconnu ou inactif.",
              type: "string"
            }
          ]
        },
        options: {}
      },
      id: "w8",
      name: "Reponse Erreur",
      type: "n8n-nodes-base.set",
      typeVersion: 3.4,
      position: [1140, 480]
    }
  ],
  connections: {
    "Webhook": {main: [[{node: "Supabase Cabinet", type: "main", index: 0}]]},
    "Supabase Cabinet": {main: [[{node: "Set Variables", type: "main", index: 0}]]},
    "Set Variables": {main: [[{node: "Cabinet OK?", type: "main", index: 0}]]},
    "Cabinet OK?": {main: [
      [{node: "Claude Generation", type: "main", index: 0}],
      [{node: "Reponse Erreur", type: "main", index: 0}]
    ]},
    "Claude Generation": {main: [[{node: "Generer Word", type: "main", index: 0}]]},
    "Generer Word": {main: [[{node: "Reponse OK", type: "main", index: 0}]]}
  },
  settings: {
    executionOrder: "v1",
    saveExecutionProgress: true,
    saveDataSuccessExecution: "all",
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
    if (res.statusCode === 200) {
      const j = JSON.parse(data);
      console.log("OK -", j.name, "- Nodes:", j.nodes.length);
      j.nodes.forEach(n => console.log("  -", n.name, "("+n.type.split('.').pop()+")"));
    } else {
      console.log("Error:", data.substring(0, 500));
    }
  });
});
req.write(body);
req.end();
