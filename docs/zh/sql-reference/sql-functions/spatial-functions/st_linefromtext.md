---
displayed_sidebar: docs
---

# ST_LineFromText,ST_LineStringFromText

将 WKT (Well Known Text) 转换为 Line 形式的内存表示。

## 语法

```Haskell
GEOMETRY ST_LineFromText(VARCHAR wkt)
```

## 示例

```Plain Text
MySQL > SELECT ST_AsText(ST_LineFromText("LINESTRING (1 1, 2 2)"));
+---------------------------------------------------------+
| st_astext(st_linefromtext('LINESTRING (1 1, 2 2)'))     |
+---------------------------------------------------------+
| LINESTRING (1 1, 2 2)                                   |
+---------------------------------------------------------+
```

## 关键词

ST_LINEFROMTEXT,ST_LINESTRINGFROMTEXT,ST,LINEFROMTEXT,LINESTRINGFROMTEXT