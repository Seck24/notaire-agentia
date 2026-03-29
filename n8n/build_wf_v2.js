const https = require('https');

// V2: Single Respond node, no branching issue
// Flow: Webhook → Verifier Cabinet → Code (check+route) → Extraction → Generation → Word → Respond
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
        jsCode: `// Check cabinet and prepare data
const webhookData = $('Webhook Entree').item.json;
const cabinetResult = $input.item.json;

// cabinetResult is the array from Supabase
const cabinets = Array.isArray(cabinetResult) ? cabinetResult : [cabinetResult];

if (!cabinets || cabinets.length === 0 || !cabinets[0].cabinet_id) {
  return { json: { _error: true, success: false, error: 'Cabinet non reconnu ou inactif.' } };
}

const cabinet = cabinets[0];
return {
  json: {
    _error: false,
    cabinet_id: cabinet.cabinet_id,
    nom_cabinet: cabinet.nom_cabinet,
    plan: cabinet.plan,
    type_acte: webhookData.body.type_acte,
    form_data: webhookData.body.form_data || {},
    documents: webhookData.body.documents || []
  }
};`
      },
      id: "n3",
      name: "Preparer Donnees",
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: [700, 300]
    },
    {
      parameters: {
        conditions: {
          options: {caseSensitive: true, leftValue: ""},
          conditions: [{
            id: "check",
            leftValue: "={{ $json._error }}",
            rightValue: true,
            operator: {type: "boolean", operation: "notEquals"}
          }],
          combinator: "and"
        }
      },
      id: "n4",
      name: "Cabinet OK?",
      type: "n8n-nodes-base.if",
      typeVersion: 2,
      position: [920, 300]
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
        jsonBody: `={{ (() => {
  const d = $('Preparer Donnees').item.json;
  return JSON.stringify({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    system: 'Tu es un assistant notarial expert en droit ivoirien et OHADA. Extrais les informations structurees des documents fournis. Reponds UNIQUEMENT en JSON valide sans markdown. Si une information est illisible ou absente mets null.',
    messages: [{
      role: 'user',
      content: 'Type acte: ' + d.type_acte + '. Informations formulaire: ' + JSON.stringify(d.form_data) + '. Analyse et extrais toutes les informations pertinentes. Reponds en JSON.'
    }]
  });
})() }}`,
        options: {timeout: 60000}
      },
      id: "n5",
      name: "Extraction Claude",
      type: "n8n-nodes-base.httpRequest",
      typeVersion: 4.2,
      position: [1140, 200],
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
        jsonBody: `={{ (() => {
  const d = $('Preparer Donnees').item.json;
  const ext = $('Extraction Claude').item.json.content ? $('Extraction Claude').item.json.content[0].text : '{}';
  const dateStr = new Date().toLocaleDateString('fr-FR');
  return JSON.stringify({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4000,
    system: "Tu es un redacteur d'actes notariaux expert en droit ivoirien et OHADA. Regles: 1. Style notarial formel ivoirien 2. References legales (articles, lois) 3. Sections standards 4. [A COMPLETER] si info manquante 5. DRAFT pas definitif",
    messages: [{
      role: 'user',
      content: 'Redige un acte de ' + d.type_acte + '.\\n\\nINFORMATIONS DOSSIER:\\n' + JSON.stringify(d.form_data) + '\\n\\nEXTRAIT DOCUMENTS:\\n' + ext + '\\n\\nCABINET: ' + d.nom_cabinet + '\\nDATE: ' + dateStr + '\\n\\nGenere acte complet et professionnel.'
    }]
  });
})() }}`,
        options: {timeout: 90000}
      },
      id: "n6",
      name: "Generation Acte",
      type: "n8n-nodes-base.httpRequest",
      typeVersion: 4.2,
      position: [1380, 200],
      credentials: {anthropicApi: {id: "ajXSfBIozmvN1PRm", name: "Anthropic account"}}
    },
    {
      parameters: {
        method: "POST",
        url: "http://localhost:8001/generate-word",
        sendBody: true,
        specifyBody: "json",
        jsonBody: `={{ (() => {
  const d = $('Preparer Donnees').item.json;
  const txt = $('Generation Acte').item.json.content[0].text;
  return JSON.stringify({
    type_acte: d.type_acte,
    texte_acte: txt,
    cabinet_nom: d.nom_cabinet
  });
})() }}`,
        options: {timeout: 30000}
      },
      id: "n7",
      name: "Generer Word",
      type: "n8n-nodes-base.httpRequest",
      typeVersion: 4.2,
      position: [1620, 200]
    },
    {
      parameters: {
        jsCode: `// Format success response
const word = $input.item.json;
return {
  json: {
    success: true,
    filename: word.filename,
    docx_base64: word.docx_base64,
    avertissement: 'Ce document est un draft genere par IA. Il doit etre valide par le Notaire avant tout usage juridique.'
  }
};`
      },
      id: "n8",
      name: "Format Reponse OK",
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: [1860, 200]
    },
    {
      parameters: {
        jsCode: `// Format error response
const d = $('Preparer Donnees').item.json;
return {
  json: {
    success: false,
    error: d.error || 'Cabinet non reconnu ou inactif.'
  }
};`
      },
      id: "n9",
      name: "Format Erreur",
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: [1140, 480]
    }
  ],
  connections: {
    "Webhook Entree": {main: [[{node: "Verifier Cabinet", type: "main", index: 0}]]},
    "Verifier Cabinet": {main: [[{node: "Preparer Donnees", type: "main", index: 0}]]},
    "Preparer Donnees": {main: [[{node: "Cabinet OK?", type: "main", index: 0}]]},
    "Cabinet OK?": {main: [
      [{node: "Extraction Claude", type: "main", index: 0}],
      [{node: "Format Erreur", type: "main", index: 0}]
    ]},
    "Extraction Claude": {main: [[{node: "Generation Acte", type: "main", index: 0}]]},
    "Generation Acte": {main: [[{node: "Generer Word", type: "main", index: 0}]]},
    "Generer Word": {main: [[{node: "Format Reponse OK", type: "main", index: 0}]]}
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
    if (res.statusCode === 200) {
      const j = JSON.parse(data);
      console.log("ID:", j.id);
      console.log("Name:", j.name);
      console.log("Nodes:", j.nodes.length);
      j.nodes.forEach(n => console.log("  -", n.name));
    } else {
      console.log("Error:", data.substring(0, 500));
    }
  });
});
req.write(body);
req.end();
