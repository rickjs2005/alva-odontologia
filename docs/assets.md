# Assets — registro de geração

Tudo gerado via Higgsfield MCP em 2026-07-25. Modelos: `nano_banana_pro`
(imagem, 1k, 2 créditos cada) e `kling3_0` mode `pro` sem áudio (vídeo 5s,
8,75 créditos cada).

## Keyframe mestre

Define rosto, luz, madeira e paleta. **Todo o resto deriva dele por
referência** — é o que impede o site de parecer sete lugares diferentes.

| | |
|---|---|
| Job | `51e6d4d8-6798-4d51-a639-bbbb5f4767e0` |
| Escolhido entre | 4 candidatos (`count: 4`) |
| Custo | 8 créditos |

Personagem: Dra. Marina Alencastro — mulher brasileira, ~38 anos, cabelo
castanho ondulado, jaleco branco de gola alta.

## Stills de plano

| # | Plano | Job | Créditos |
|---|---|---|---|
| 01 | A porta | `c33930bc-9b0b-42ad-a5df-a69419421d53` | 2 |
| 02 | A recepção | `e576da45-fe70-4817-97a2-0c5fe0642534` | 2 |
| 03 | O encontro | `8f50c901-8aec-4c99-9c93-36a1a54b7a21` | 2 |
| 04 | O corredor | `9de58282-8691-4370-bb01-baca545e3cbe` | 2 |
| 05 | O consultório | `49de1895-3716-480a-8cb3-340c53f9ffe8` | 2 |
| 06 | O detalhe (descartado) | `4f13f0c5-d21e-40e9-8ce2-cf1410704aca` | 2 |
| 06 | O detalhe (usado) | `ab1e079d-e393-490f-824d-5c6bbd89a98e` | 4 |
| 07 | O sorriso | `b27efa54-2579-459b-8ff4-78352d700138` | 2 |

O primeiro still 06 saiu com dedo malformado e pano cirúrgico verde brigando
com a paleta de madeira. Refeito com uma mão só entrando em quadro e tecido
branco.

## Clipes

| # | Job | Créditos |
|---|---|---|
| 01 | `f4182937-d683-40ad-b3bb-257e10ddfa5e` (piloto) | 8,75 |
| 02 | `05d3cfd5-4a7f-4e32-bc54-e8d0ff7bb61e` | 8,75 |
| 03 | `d9da6c82-5deb-458b-9563-72b5948d8065` | 8,75 |
| 04 | `6167a276-b6e9-4a95-95bb-e86977ccedb4` | 8,75 |
| 05 | `6c0538cd-954e-4587-a863-f0b2a1c2893a` | 8,75 |
| 06 | `028e9399-3a27-40ac-93df-f1efa3ee874f` | 8,75 |
| 07 | `cd84e1ef-5a8e-4fef-be5d-217bb1f60368` | 8,75 |

Todo prompt de clipe termina em `very slow camera movement, shallow depth of
field, film grain, no cuts`. É isso que mantém os sete planos parecendo o
mesmo filme.

O Higgsfield sugeriu o preset "IN THE DARK" no primeiro clipe — recusado com
`declined_preset_id`, o preset mudaria a fotografia.

## Master

- 7 clipes de 5s com **crossfade de 0,4s** entre eles → **32,53s**
- `minterpolate` interpolando 24→30fps por clipe, antes do crossfade (aplicar
  depois borra os cortes)
- Grade leve `eq=contrast=1.05:saturation=0.94:gamma=0.98` para unificar
- `-g 1` — todo frame keyframe. **Sem isso o scrub morre.**
- 1280×720, CRF 29 `preset slow`, `+faststart` → **11,4 MB**

O CRF subiu de 24 para 29 depois da verificação em produção: com 17,9 MB e
`preload="metadata"`, cada seek do scrub virava um range request na CDN e o
vídeo ficava minutos atrás do scroll (ao fim do hero tinha andado 10s de 32s).
Em disco isso não aparece. A correção foi peso menor **e** `preload="auto"`.

Os limites de plano em `lib/scenes.ts` são os centros dos crossfades, por isso
não são frações redondas.

Medição que decidiu o CRF (clipe de 5s, 720p, 30fps, GOP 1):

| CRF | 5s | Master estimado |
|---|---|---|
| 20 | 3,59 MB | 25,1 MB |
| 24 | 2,33 MB | 16,3 MB |
| 28 | 1,57 MB | 11,0 MB |

## Total gasto até aqui

| Bloco | Créditos |
|---|---|
| Keyframe mestre | 8 |
| Stills (incl. refação do 06) | 18 |
| Clipes | 61,25 |
| **Total** | **87,25** |

Teto: 250. Restante para as imagens do site: ~163.
