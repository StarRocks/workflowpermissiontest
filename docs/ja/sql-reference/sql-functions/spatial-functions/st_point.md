---
displayed_sidebar: docs
---

# ST_Point

指定されたX座標とY座標を持つ対応する Point を返します。現時点では、この値は球面集合でのみ意味を持ちます。X/Y は経度/緯度に対応します。

> **Caution**
>
> ST_Point() を直接選択すると、処理が止まることがあります。

## Syntax

```Haskell
POINT ST_Point(DOUBLE x, DOUBLE y)
```

## Examples

```Plain Text
MySQL > SELECT ST_AsText(ST_Point(24.7, 56.7));
+---------------------------------+
| st_astext(st_point(24.7, 56.7)) |
+---------------------------------+
| POINT (24.7 56.7)               |
+---------------------------------+
```

## keyword

ST_POINT,ST,POINT