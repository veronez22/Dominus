# 📱 UX/UI para Cardápios em Tablets

## 🎯 Objetivo
Criar uma interface que seja **rápida, clara e intuitiva** para usuários comprando comida num tablet.

---

## 1️⃣ O Usuário está COM PRESSA
- Quer achar a comida em **segundos**
- Quer **clicar pouquíssimas vezes**
- Quer ver o **preço claramente**
- Quer **confirmar a compra rápido**

**Como aplicar:**
- Menu visível e simples (máx 6-8 categorias)
- Botões **grandes e bem espaçados**
- Preço em **destaque visual**
- Carrinho sempre acessível

---

## 2️⃣ Toque > Mouse (Botões maiores!)
No tablet, você clica com o dedo, não mouse.

**Regra de ouro:**
- Botões devem ter **mínimo 44x44px** (alcançar com polegar confortavelmente)
- Espaçamento entre botões: **16-24px**
- Touch target (área de clique) > tamanho visual

**Exemplo ruim:**
```
[btn] [btn] [btn]  ← muito apertado
```

**Exemplo bom:**
```
┌─────────┐
│  Botão  │
└─────────┘
    ↓ 20px ↓
┌─────────┐
│  Botão  │
└─────────┘
```

---

## 3️⃣ Hierarquia Visual (o que é importante?)
Seu olho deve ir para o mais importante:

1. **Título da categoria** (grande, claro)
2. **Foto do item** (apetitoso!)
3. **Nome e preço** (decisão de compra)
4. **Botão "Adicionar"** (ação principal)

**No nosso projeto:**
- Foto grande
- Nome e preço destacados
- Botão bem visível

---

## 4️⃣ Contraste e Legibilidade
Tablet pode estar numa mesa com luz ambiente.

**Regras:**
- Fundo escuro + texto claro (nosso caso: #111 + branco ✓)
- Texto mínimo **16px** em descrições
- Botões com **bastante contraste**
- Cores que funcionam em qualquer luz

---

## 5️⃣ Heurísticas de Nielsen (as principais pra tablets)

| Heurística | O que significa | Exemplo |
|-----------|-----------------|---------|
| **Controle do usuário** | Usuário consegue cancelar, voltar, sair | Botão X para fechar modal |
| **Match com realidade** | Linguagem clara, não técnica | "Adicionar ao carrinho" (não "append item") |
| **Prevenção de erros** | Evitar que erre | Confirmar antes de limpar carrinho |
| **Feedback** | Resposta imediata | Item some do carrinho quando clica |
| **Flexibilidade** | Atalhos para usuários experientes | Swipe para próxima categoria |

---

## 📊 Checklist: O que precisamos melhorar

- [ ] Botões maiores (tocar com o dedo confortável)
- [ ] Espaçamento melhor entre itens
- [ ] Cores mais profissionais e com contraste
- [ ] Tipografia com hierarquia clara
- [ ] Feedback visual (hover, clique, carregamento)
- [ ] Modal e carrinho bem definidos
- [ ] Responsivo pra tablets (800-1024px)

---

## 🎨 Próxima: Paleta de Cores
Vamos escolher cores que transmitam **qualidade** e **apetite**!
