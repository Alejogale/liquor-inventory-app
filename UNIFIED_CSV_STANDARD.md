# 📊 InvyEasy Unified CSV Standard

## 🎯 STANDARDIZED COLUMN FORMAT

All imports, exports, reports, and templates will use these **exact column names**:

### **INVENTORY ITEMS - STANDARD FORMAT**
```csv
Brand,Category,Supplier,Par Level,Threshold,Barcode,Price Per Item
Grey Goose,Vodka,ABC Liquors,12,3,123456789,25.99
Jameson,Whiskey,Premium Spirits,8,2,987654321,35.50
```

### **SUPPLIERS - STANDARD FORMAT**
```csv
Name,Email,Phone,Contact Person,Notes
ABC Liquors,sales@abc.com,555-1234,John Smith,Primary liquor vendor
Premium Spirits,orders@premium.com,555-5678,Sarah Johnson,High-end spirits
```

### **CATEGORIES - STANDARD FORMAT**
```csv
Name
Vodka
Whiskey
Beer
Wine
```

### **ROOMS - STANDARD FORMAT**
```csv
Name,Type,Description,Display Order
Main Bar,Bar,Primary service area,1
Storage Room,Storage,Back inventory storage,2
Wine Cellar,Storage,Temperature controlled wine storage,3
```

## 🔄 WHAT NEEDS TO BE UPDATED

### Current Issues:
- ❌ Export uses: "Category,Brand,Barcode,Supplier..."
- ❌ Import expects: "brand,category_name,supplier_name..."
- ❌ Reports use different field names
- ❌ No consistency across the app

### Standardization Plan:
1. ✅ **Import validation** - Update to match export format
2. ✅ **Export headers** - Keep current format (it's good)
3. ✅ **CSV templates** - Generate using standard format
4. ✅ **Report formats** - Align with standard
5. ✅ **Database mapping** - Update field mappings

## 📝 IMPLEMENTATION NOTES

### Column Mapping:
- **Brand** → `brand` (database field)
- **Category** → lookup `categories.name` → `category_id`
- **Supplier** → lookup `suppliers.name` → `supplier_id`
- **Par Level** → `par_level`
- **Threshold** → `threshold`
- **Barcode** → `barcode`
- **Price Per Item** → `price_per_item`

### Benefits:
- ✅ Export a CSV → Import the same CSV (perfect cycle)
- ✅ Templates match actual format
- ✅ Reports use same headers
- ✅ User confusion eliminated
- ✅ Documentation consistency