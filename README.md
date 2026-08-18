# EletroNobre

Template reutilizável para eletricistas e empresas de serviços elétricos no catálogo do Coruja Host.

## Proposta visual

- identidade sofisticada em marfim, preto e cobre;
- composição editorial e foco em acabamento de alto padrão;
- páginas Início, Serviços, Sobre, Contato e Conteúdos;
- projetos, avaliações, serviços, processo, regiões e FAQ editáveis;
- Blog real carregado da API pública do Coruja Host;
- formulário real de orçamento via WhatsApp;
- logo, favicon, cores, imagens, contatos, textos e SEO editáveis;
- preview do editor com atualização em tempo real;
- Analytics oficial do Coruja Host;
- SEO por página e schema `Electrician`;
- SPA preparada para Cloudflare Pages com `_redirects`.

## Build

```bash
npm install
npm test
npm run build
```

Saída: `dist`.

## Compatibilidade validada

- contrato público V2 com schema editável usando paths absolutos;
- conteúdo remoto via `VITE_CORUJA_PROJECT_ID` e API pública do Coruja Host;
- preview por slug, por `/preview/:id` e por `/site-preview/:id`;
- bridge do editor visual com atualização de campos e coleções em tempo real;
- assets resolvidos no contexto da prévia, sem imagens vazias;
- card de catálogo configurado para a área **Modelos**.
