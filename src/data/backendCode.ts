export const PYTHON_CODE = `from flask import Flask, jsonify, request, render_template
import json
import os

app = Flask(__name__)

# Shop details
SHOP_NAME = "Sharma Kirana Store"
SHOP_LOCATION = "Delhi, India"
DATA_FILE = "inventory.json"

# Load inventory from file
def load_inventory():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, "r") as f:
            return json.load(f)
    else:
        default_data = [
            {"id": 1, "name": "Rice", "price": 50, "stock": 100},
            {"id": 2, "name": "Sugar", "price": 40, "stock": 50},
            {"id": 3, "name": "Oil", "price": 120, "stock": 30}
        ]
        save_inventory(default_data)
        return default_data

# Save inventory to file
def save_inventory(data):
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=4)

@app.route('/')
def home():
    return render_template('index.html', shop_name=SHOP_NAME, shop_location=SHOP_LOCATION)

@app.route('/api/items', methods=['GET'])
def get_items():
    return jsonify(load_inventory())

@app.route('/api/items', methods=['POST'])
def add_item():
    data = request.json
    if not data or "name" not in data or "price" not in data or "stock" not in data:
        return jsonify({"error": "Invalid data"}), 400
    inventory = load_inventory()
    new_id = max(item["id"] for item in inventory) + 1 if inventory else 1
    new_item = {
        "id": new_id,
        "name": data["name"],
        "price": data["price"],
        "stock": data["stock"]
    }
    inventory.append(new_item)
    save_inventory(inventory)
    return jsonify(new_item), 201

@app.route('/api/purchase/<int:item_id>', methods=['POST'])
def purchase_item(item_id):
    inventory = load_inventory()
    for item in inventory:
        if item["id"] == item_id:
            if item["stock"] > 0:
                item["stock"] -= 1
                save_inventory(inventory)
                return jsonify({"message": f"Purchased {item['name']} successfully!"})
            else:
                return jsonify({"error": "Out of stock"}), 400
    return jsonify({"error": "Item not found"}), 404

if __name__ == '__main__':
    app.run(debug=True, port=5000)
`;

export const JAVA_CODE = `import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import spark.Spark;

import java.io.*;
import java.lang.reflect.Type;
import java.util.*;

class Item {
    int id;
    String name;
    double price;
    int stock;
}

public class KiranaBackend {
    private static final String DATA_FILE = "inventory.json";
    private static final Gson gson = new Gson();

    public static void main(String[] args) {
        String SHOP_NAME = "Sharma Kirana Store";
        String SHOP_LOCATION = "Delhi, India";

        Spark.port(8081);

        Spark.get("/api/shopinfo", (req, res) -> {
            res.type("application/json");
            return gson.toJson(Map.of("shop_name", SHOP_NAME, "shop_location", SHOP_LOCATION));
        });

        Spark.get("/api/items", (req, res) -> {
            res.type("application/json");
            return gson.toJson(loadInventory());
        });

        Spark.post("/api/items", (req, res) -> {
            res.type("application/json");
            Item newItem = gson.fromJson(req.body(), Item.class);
            List<Item> inventory = loadInventory();
            int newId = inventory.stream().mapToInt(i -> i.id).max().orElse(0) + 1;
            newItem.id = newId;
            inventory.add(newItem);
            saveInventory(inventory);
            return gson.toJson(newItem);
        });

        Spark.post("/api/purchase/:id", (req, res) -> {
            res.type("application/json");
            int id = Integer.parseInt(req.params(":id"));
            List<Item> inventory = loadInventory();
            for (Item i : inventory) {
                if (i.id == id) {
                    if (i.stock > 0) {
                        i.stock--;
                        saveInventory(inventory);
                        return gson.toJson(Map.of("message", "Purchased " + i.name + " successfully!"));
                    } else {
                        return gson.toJson(Map.of("error", "Out of stock"));
                    }
                }
            }
            return gson.toJson(Map.of("error", "Item not found"));
        });

        System.out.println("Java Kirana Backend running on http://localhost:8081");
    }

    private static List<Item> loadInventory() {
        try (Reader reader = new FileReader(DATA_FILE)) {
            Type listType = new TypeToken<List<Item>>() {}.getType();
            return gson.fromJson(reader, listType);
        } catch (IOException e) {
            return new ArrayList<>();
        }
    }

    private static void saveInventory(List<Item> inventory) {
        try (Writer writer = new FileWriter(DATA_FILE)) {
            gson.toJson(inventory, writer);
        } catch (IOException e) {
            System.out.println("Error saving inventory: " + e.getMessage());
        }
    }
}
`;

export const ORIGINAL_HTML_CODE = `<!DOCTYPE html>
<html>
<head>
    <title>{{ shop_name }}</title>
    <style>
        body { font-family: Arial; margin: 20px; background-color: #f9f9f9; }
        .shop-info { background: #4CAF50; color: white; padding: 10px; border-radius: 5px; }
        table { border-collapse: collapse; width: 100%; background: white; }
        th, td { border: 1px solid #ddd; padding: 10px; text-align: center; }
        th { background-color: #4CAF50; color: white; }
        button { padding: 6px 12px; border: none; background-color: #4CAF50; color: white; cursor: pointer; }
        button:hover { background-color: #45a049; }
        form { background: white; padding: 15px; margin-top: 20px; }
        input { padding: 8px; margin: 5px; border: 1px solid #ccc; border-radius: 4px; }
    </style>
</head>
<body>
    <div class="shop-info">
        <h1 id="shopName">{{ shop_name }}</h1>
        <p id="shopLoc">{{ shop_location }}</p>
    </div>

    <!-- Backend Selector Dropdown -->
    <div style="margin: 15px 0;">
        <label>Select Active Backend: </label>
        <select id="backendSelect">
            <option value="http://localhost:5000">Python Flask (Port 5000)</option>
            <option value="http://localhost:8081">Java Spark (Port 8081)</option>
        </select>
    </div>

    <h2>Store Inventory</h2>
    <table id="inventoryTable">
        <thead>
            <tr>
                <th>ID</th>
                <th>Item Name</th>
                <th>Price (INR)</th>
                <th>Stock</th>
                <th>Action</th>
            </tr>
        </thead>
        <tbody>
            <!-- Loaded via fetch from /api/items -->
        </tbody>
    </table>

    <form id="addItemForm">
        <h3>Add New Grocery Item</h3>
        <input type="text" id="name" placeholder="Item Name (e.g. Atta)" required />
        <input type="number" id="price" placeholder="Price (INR)" required />
        <input type="number" id="stock" placeholder="Stock Qty" required />
        <button type="submit">Add to Inventory</button>
    </form>
</body>
</html>
`;
