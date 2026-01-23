---
displayed_sidebar: docs
---

# ST_Y

如果 point 属于有效的 Point 类型，则返回对应的 Y 坐标值。

## 语法

```Haskell
DOUBLE ST_Y(POINT point)
```

## 示例

```Plain Text
MySQL > SELECT ST_Y(ST_Point(24.7, 56.7));
+----------------------------+
| st_y(st_point(24.7, 56.7)) |
+----------------------------+
|                       56.7 |
+----------------------------+
```

## 关键词

ST_Y,ST,Y