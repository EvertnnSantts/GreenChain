(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/messages/pt.json.[json].cjs [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {

module.exports = {
    "meta": {
        "title": "GreenChain — Recicle e Ganhe",
        "description": "Plataforma Recycle-to-Earn: conectando cidadãos a lixeiras inteligentes e recompensando com tokens $GREEN.",
        "ogDescription": "Recicle materiais, ganhe $GREEN tokens. Powered by Celo."
    },
    "header": {
        "live": "Ao vivo",
        "tagline": "Recycle to Earn"
    },
    "footer": {
        "copyright": "GreenChain © 2025 — Recycle-to-Earn Protocol",
        "network": "Celo (PoS)",
        "token": "$GREEN (ERC-20)",
        "version": "v1.0",
        "networkNote": "Proof of Ship (PoS) é um programa da Celo"
    },
    "nav": {
        "user": "Painel do Usuário",
        "userShort": "Usuário",
        "company": "Dashboard Empresa",
        "companyShort": "Empresa",
        "simulator": "Simulador IoT",
        "simulatorShort": "Simulador"
    },
    "wallet": {
        "connect": "Conectar Carteira",
        "connectShort": "Conectar",
        "wrongNetwork": "Rede incorreta"
    },
    "userDashboard": {
        "ranking": "Ranking",
        "walletBalance": "Saldo da carteira",
        "networkMain": "Rede: Celo",
        "networkLabel": "Rede Principal / Alfajores",
        "tokenRate": "1 $GREEN = R$ {rate}",
        "recycled": "{kg} kg reciclados",
        "dailyGoals": {
            "title": "Metas Diárias",
            "description": "Progresso de hoje por material",
            "complete": "Completo",
            "plastico": "Plástico hoje",
            "vidro": "Vidro hoje",
            "metal": "Metal hoje",
            "papel": "Papel hoje"
        },
        "impact": {
            "co2Label": "CO₂ Evitado",
            "co2Sub": "de emissão poupada",
            "treesLabel": "Árvores Salvas",
            "treesSub": "equivalente ao ano",
            "recycledLabel": "Total Reciclado",
            "recycledSub": "peso total descartado"
        },
        "history": {
            "title": "Histórico de Descartes",
            "description": "Últimas transações registradas",
            "empty": "Nenhum descarte registrado ainda.",
            "colDate": "Data",
            "colMaterial": "Material",
            "colWeight": "Peso",
            "colTokens": "Tokens"
        }
    },
    "companyDashboard": {
        "title": "Dashboard Empresa",
        "subtitle": "Visão B2B — GreenChain HQ",
        "live": "Ao Vivo",
        "metrics": {
            "revenue": "Lucro Total Estimado",
            "revenueSub": "receita bruta acumulada",
            "bins": "Lixeiras Ativas",
            "binsSub": "de {total} instaladas",
            "volume": "Volume Coletado",
            "volumeSub": "{tons} toneladas",
            "tokens": "Tokens Emitidos",
            "tokensSub": "$GREEN distribuídos"
        },
        "chart": {
            "title": "Receita vs. Custo (R$)",
            "description": "Últimos 6 meses — receita da venda de materiais vs. custo de tokens",
            "revenue": "Receita",
            "cost": "Custo Tokens",
            "ariaLabel": "Gráfico de receita vs custo"
        },
        "breakdown": {
            "title": "Distribuição por Material",
            "description": "Proporção do volume total coletado",
            "empty": "Nenhum dado disponível."
        },
        "bins": {
            "title": "Monitoramento de Lixeiras",
            "description": "Status em tempo real das lixeiras inteligentes",
            "available": "Disponível",
            "full": "Cheia",
            "maintenance": "Manutenção"
        }
    },
    "simulator": {
        "title": "Simulador IoT",
        "subtitle": "Lixeira Inteligente — Modo Desenvolvimento",
        "online": "Online",
        "stepOf": "PASSO {step} DE 4",
        "stepDescriptions": {
            "1": "Identifique o usuário para liberar a lixeira",
            "2": "Informe o material e o peso medido pela balança",
            "3": "Revise os cálculos antes de confirmar",
            "4": "Transação concluída e dados sincronizados"
        },
        "steps": {
            "recognize": "Reconhecer",
            "materials": "Materiais",
            "process": "Processar",
            "confirm": "Confirmar"
        },
        "footer": "As ações neste simulador atualizam imediatamente o Painel do Usuário e o Dashboard da Empresa via estado global compartilhado.",
        "step1": {
            "title": "Reconhecimento do Usuário",
            "description": "Simula leitura de QR Code / biometria",
            "authenticate": "Autenticar e Liberar Lixeira"
        },
        "step2": {
            "title": "Entrada de Dados",
            "description": "Material detectado pela lixeira inteligente",
            "materialType": "Tipo de Material",
            "weight": "Peso — Leitura da Balança",
            "bin": "Lixeira",
            "next": "Avançar para Processamento"
        },
        "step3": {
            "title": "Processamento",
            "description": "Cálculo em tempo real — aguardando confirmação",
            "material": "Material",
            "weight": "Peso",
            "bin": "Lixeira",
            "tokensLabel": "Tokens ao usuário",
            "revenueLabel": "Receita empresa",
            "costLabel": "Custo tokens",
            "profitLabel": "Lucro líquido",
            "confirm": "Confirmar Descarte"
        },
        "step4": {
            "title": "Descarte Confirmado!",
            "description": "Transação registrada na blockchain",
            "user": "Usuário",
            "material": "Material",
            "weight": "Peso",
            "tokens": "Tokens Ganhos",
            "revenue": "Receita Empresa",
            "reset": "Nova Simulação",
            "syncNote": "Os dados do Painel do Usuário e do Dashboard da Empresa foram atualizados em tempo real."
        },
        "materials": {
            "plastico": "Plástico",
            "vidro": "Vidro",
            "metal": "Metal / Alumínio",
            "papel": "Papel"
        }
    },
    "langSwitcher": {
        "label": "Idioma",
        "pt": "PT",
        "en": "EN",
        "ptFull": "Português",
        "enFull": "English"
    }
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=messages_pt_json_%5Bjson%5D_cjs_1281nqx._.js.map