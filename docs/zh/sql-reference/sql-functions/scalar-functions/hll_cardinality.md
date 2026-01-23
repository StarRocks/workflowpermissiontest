---
displayed_sidebar: docs
---

# hll_cardinality

计算单个 HLL 类型值的基数。

## Syntax

```Haskell
HLL_CARDINALITY(hll)
```

## Examples

```plain text
MySQL > select HLL_CARDINALITY(uv_set) from test_uv;
+---------------------------+
| hll_cardinality(`uv_set`) |
+---------------------------+
|                         3 |
+---------------------------+
```

## keyword

HLL,HLL_CARDINALITY