# 🎨 Inspiração Goomer: Padrões de Design

## 📋 O que torna a Goomer profissional

### 1. **Paleta de Cores**
```
Primária: #FFB84D (laranja quente - chama atenção pro "Adicionar")
Secundária: #F5F5F5 (cinza claro - fundo)
Destaque: #333333 (cinza escuro - texto)
Sucesso: #4CAF50 (verde - confirmação)
Erro: #F44336 (vermelho - aviso)
```

**Por que funciona:**
- Laranja estimula apetite
- Fundo claro contrasta bem
- Texto escuro é legível
- Feedback claro com cores específicas

---

### 2. **Tipografia**
```
Títulos: Font-weight 700, 24-28px
Nomes de item: Font-weight 600, 18-20px
Descrição: Font-weight 400, 14px (mais cinzento)
Botões: Font-weight 600, 16px
```

**Hierarquia:**
- Título grande > nome item > descrição

---

### 3. **Layout da Categoria**
```
┌─────────────────────────────────┐
│  CATEGORIAS (Menu horizontal)   │
├─────────────────────────────────┤
│                                 │
│  ┌─────┐  ┌─────┐  ┌─────┐   │
│  │Item │  │Item │  │Item │   │
│  │ +   │  │ +   │  │ +   │   │
│  └─────┘  └─────┘  └─────┘   │
│                                 │
│  ┌─────┐  ┌─────┐              │
│  │Item │  │Item │              │
│  │ +   │  │ +   │              │
│  └─────┘  └─────┘              │
│                                 │
└─────────────────────────────────┘
```

- Cards com **espaçamento generoso**
- Foto grande e apetitosa
- Nome + descrição abaixo
- Preço à direita (destaque)
- Botão "+ Adicionar" com cor primária

---

### 4. **Card do Item (Goomer style)**
```
┌──────────────────────────┐
│                          │
│  [      IMAGEM      ]    │
│  Bem grande (160x160)    │
│                          │
├──────────────────────────┤
│ Carne Moída              │
│ Esfiha salgada...        │  ← Descrição pequena, cinzenta
│                          │
│ R$ 5,90      [+ ADD]     │  ← Preço + botão
└──────────────────────────┘
```

**Características:**
- Imagem ocupa 60% do card
- Foto de qualidade (deixa de boca aberta)
- Botão "+ ADD" em laranja
- Preço bem visível
- Padding generoso (16px mínimo)

---

### 5. **Cabeçalho (Header)**
```
┌─────────────────────────────────────┐
│ 🏪 DOMINUS     [Menu]  🛒 1 item   │
└─────────────────────────────────────┘
```

- Logo/nome do restaurante à esquerda
- Menu de navegação (categorias)
- Carrinho à direita (sempre visível!)
- Fundo com cor discreta (#FFF ou #F5F5F5)

---

### 6. **Sidebar de Categorias (alternativa)**
```
┌──────────┐
│ DESTAQUES│ ← Ativa (laranja)
│ ESFIHAS  │
│CIGARRETES│
│ BEBIDAS  │
│ COMBOS   │
└──────────┘
```

- Categoria ativa com fundo laranja e texto branco
- Categoria inativa com texto cinzento
- Scroll suave

---

### 7. **Modal de Produto Detalhado**
```
┌─────────────────────────────┐
│ X   Carne                   │
├─────────────────────────────┤
│                             │
│       [IMAGEM GRANDE]       │
│                             │
│ Esfiha salgada de carne...  │
│                             │
│ Ingredientes: ...           │
│                             │
│ Quantidade: [−] 1 [+]       │
│ Preço: R$ 5,90              │
│                             │
│  [ADICIONAR AO CARRINHO]    │
└─────────────────────────────┘
```

- Modal centralizado (não em canto)
- X para fechar fácil
- Quantidade ajustável
- Botão CTA bem grande

---

### 8. **Carrinho (Sidebar)**
```
┌─────────────────────┐
│ 🛒 CARRINHO (3)    │
├─────────────────────┤
│ Carne              │
│ Qty: 2 | R$ 10,30  │
│ [❌]               │
├─────────────────────┤
│ Bebida             │
│ Qty: 1 | R$ 2,50   │
│ [❌]               │
├─────────────────────┤
│ TOTAL: R$ 12,80    │
│                     │
│ [FECHAR PEDIDO]     │
└─────────────────────┘
```

- Carrinho em sidebar (direita)
- Remover com X
- Total destaque
- Botão de confirmação grande

---

### 9. **Efeitos e Feedback**
```
Hover no card:
- Sombra aumenta
- Imagem fica 1.05x maior (zoom suave)

Clique no botão:
- Animação de "press" (piscadela)
- Ícone de checkmark ou "+1"
- Toast: "Adicionado ao carrinho!"

Carrinho muda:
- Número de items atualiza
- Badge no ícone do carrinho

Modal abre/fecha:
- Fade suave (0.3s)
- Background fica escuro
```

---

## 📊 Resumo: O que vamos implementar

| Aspecto | Hoje | Depois |
|--------|------|--------|
| Cores | #111 (muito escuro) → #F5F5F5 (limpo) | Adicionar laranja (#FFB84D) |
| Botões | Pequenos | 48-56px com padding |
| Cards | Apertados | Espaço 16-24px |
| Tipografia | Ok | Melhorar hierarquia |
| Feedback | Nenhum | Hover, clique, toast |
| Modal | Básico | Melhorar design |

---

## ✅ Próximo Passo
Vamos começar com **Paleta de Cores** e aplicar no projeto real!
