use tauri_plugin_sql::{Migration, MigrationKind};

#[tauri::command]
fn save_temp_file(filename: String, data: Vec<u8>) -> Result<String, String> {
    let path = std::env::temp_dir().join(&filename);
    std::fs::write(&path, &data).map_err(|e| e.to_string())?;
    Ok(path.to_string_lossy().into_owned())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let migrations = vec![
    Migration {
        version: 1,
        description: "create initial tables",
        sql: r#"
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
INSERT OR IGNORE INTO users (id, email, name, password, role)
VALUES ('usr-001', 'admin@camping.com', 'Administrateur', 'admin123', 'admin');

CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  city TEXT,
  province TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS spots (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('TENT','RV','CABIN')),
  capacity INTEGER NOT NULL DEFAULT 1,
  price_per_night REAL NOT NULL,
  has_electricity INTEGER NOT NULL DEFAULT 0,
  has_water INTEGER NOT NULL DEFAULT 0,
  has_sewer INTEGER NOT NULL DEFAULT 0,
  size INTEGER NOT NULL DEFAULT 1,
  is_active INTEGER NOT NULL DEFAULT 1,
  description TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS reservations (
  id TEXT PRIMARY KEY,
  spot_id TEXT NOT NULL REFERENCES spots(id),
  customer_id TEXT NOT NULL REFERENCES customers(id),
  check_in TEXT NOT NULL,
  check_out TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'HOLD',
  total_price REAL NOT NULL,
  adults_count INTEGER NOT NULL DEFAULT 1,
  children_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS reservation_notes (
  id TEXT PRIMARY KEY,
  reservation_id TEXT NOT NULL REFERENCES reservations(id),
  text TEXT NOT NULL,
  author TEXT NOT NULL DEFAULT 'Admin',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
        "#,
        kind: MigrationKind::Up,
    },
    Migration {
        version: 2,
        description: "add spot detail columns and seed non-seasonal spots",
        sql: r#"
ALTER TABLE spots ADD COLUMN length_ft INTEGER;
ALTER TABLE spots ADD COLUMN width_ft INTEGER;
ALTER TABLE spots ADD COLUMN sun_percentage INTEGER;
ALTER TABLE spots ADD COLUMN ground_type TEXT;
ALTER TABLE spots ADD COLUMN amperage INTEGER;
ALTER TABLE spots ADD COLUMN notes TEXT;

INSERT OR IGNORE INTO spots (id, name, type, capacity, price_per_night, has_electricity, has_water, has_sewer, size, is_active, description, length_ft, width_ft, sun_percentage, ground_type, amperage, notes) VALUES
('T-14','Terrain 14','RV',6,55.00,1,1,1,1,1,'',60,26,50,'gravel',50,NULL),
('T-15','Terrain 15','RV',6,52.00,1,1,1,1,1,'',30,22,50,'gravel+gazon',30,NULL),
('T-16','Terrain 16','RV',6,55.00,1,1,1,1,1,'',45,25,60,'gravel',50,NULL),
('T-18','Terrain 18','RV',6,52.00,1,1,1,1,1,'',45,25,60,'gravel',30,NULL),
('T-23','Terrain 23','RV',6,52.00,1,1,1,1,1,'',30,30,60,'gravel+gazon',30,NULL),
('T-24','Terrain 24','RV',6,52.00,1,1,1,1,1,'',45,35,90,'gravel+gazon',30,NULL),
('T-25','Terrain 25','RV',6,52.00,1,1,1,1,1,'',38,27,90,'gravel+gazon',30,'Coin de rue'),
('T-51','Terrain 51','RV',6,55.00,1,1,1,1,1,'',45,35,90,'gravel+gazon',50,NULL),
('T-52','Terrain 52','RV',6,52.00,1,1,1,1,1,'',50,26,40,'gravel',30,NULL),
('T-53','Terrain 53','RV',6,52.00,1,1,1,1,1,'',43,22,90,'gravel',30,'Communique 55'),
('T-54','Terrain 54','RV',6,52.00,1,1,1,1,1,'',40,24,60,'gravel',30,NULL),
('T-55','Terrain 55','RV',6,52.00,1,1,1,1,1,'',31,37,90,'gravel+sable',30,'Communique 53'),
('T-56','Terrain 56','RV',6,52.00,1,1,1,1,1,'',50,25,40,'gravel',30,NULL),
('T-58','Terrain 58','RV',6,52.00,1,1,1,1,1,'',50,25,40,'gravel',30,NULL),
('T-60','Terrain 60','RV',6,52.00,1,1,1,1,1,'',60,30,40,'gravel',30,NULL),
('T-66','Terrain 66','RV',6,52.00,1,1,1,1,1,'',35,24,65,'gravel',30,'Entrée directe'),
('T-77','Terrain 77','RV',6,55.00,1,1,1,1,1,'',46,38,100,'gravel+gazon',50,'Coin de rue'),
('T-78','Terrain 78','RV',6,52.00,1,1,1,1,1,'',42,35,90,'gravel+gazon',30,NULL),
('T-92','Terrain 92','RV',6,52.00,1,1,1,1,1,'',55,25,40,'gravel',30,'Forêt derrière'),
('T-93','Terrain 93','RV',6,52.00,1,1,1,1,1,'',33,22,40,'gravel',30,NULL),
('T-94','Terrain 94','RV',6,52.00,1,1,1,1,1,'',38,22,40,'gravel',30,'Forêt derrière'),
('T-95','Terrain 95','RV',6,52.00,1,1,1,1,1,'',35,24,50,'gravel',30,NULL),
('T-96','Terrain 96','RV',6,52.00,1,1,1,1,1,'',45,23,5,'gravel',30,'Intime'),
('T-97','Terrain 97','RV',6,52.00,1,1,1,1,1,'',29,23,50,'gravel',30,NULL),
('T-98','Terrain 98','RV',6,49.00,1,1,0,1,1,'',34,18,50,'gravel',30,'Pas intime'),
('T-99','Terrain 99','RV',6,52.00,1,1,1,1,1,'',31,28,50,'gravel',30,NULL),
('T-100','Terrain 100','RV',6,49.00,1,1,0,1,1,'',39,19,60,'gravel+sable',30,NULL),
('T-101','Terrain 101','RV',6,49.00,1,1,0,1,1,'',25,18,40,'gravel',30,'Forêt derrière'),
('T-102','Terrain 102','RV',6,49.00,1,1,0,1,1,'',42,21,40,'sable',30,'Communique 127'),
('T-103','Terrain 103','RV',6,55.00,1,1,1,1,1,'',45,21,75,'asphalte',50,'Entrée directe'),
('T-104','Terrain 104','RV',6,49.00,1,1,0,1,1,'',50,18,40,'gravel',30,NULL),
('T-105','Terrain 105','RV',6,52.00,1,1,1,1,1,'',30,20,80,'gravel',30,NULL),
('T-106','Terrain 106','RV',6,49.00,1,1,0,1,1,'',36,25,50,'gravel+sable',30,NULL),
('T-107','Terrain 107','RV',6,52.00,1,1,1,1,1,'',35,25,75,'gravel',30,NULL),
('T-108','Terrain 108','RV',6,52.00,1,1,1,1,1,'',33,25,40,'gravel',30,'Communique 150'),
('T-109','Terrain 109','RV',6,52.00,1,1,1,1,1,'',35,20,70,'gravel',30,NULL),
('T-110','Terrain 110','RV',6,52.00,1,1,1,1,1,'',45,26,50,'gravel+sable',30,NULL),
('T-111','Terrain 111','RV',6,52.00,1,1,1,1,1,'',33,27,50,'gravel',30,NULL),
('T-112','Terrain 112','RV',6,52.00,1,1,1,1,1,'',43,25,40,'gravel+sable',30,NULL),
('T-114','Terrain 114','RV',6,52.00,1,1,1,1,1,'',43,21,30,'gravel+sable',30,NULL),
('T-116','Terrain 116','RV',6,52.00,1,1,1,1,1,'',38,28,40,'gravel',30,NULL),
('T-118','Terrain 118','RV',6,52.00,1,1,1,1,1,'',35,23,40,'gravel+gazon',30,'Intime'),
('T-120','Terrain 120','RV',6,52.00,1,1,1,1,1,'',40,30,70,'gravel+gazon',30,'Difficile à reculer'),
('T-122','Terrain 122','RV',6,52.00,1,1,1,1,1,'',43,23,70,'gravel',30,NULL),
('T-124','Terrain 124','RV',6,52.00,1,1,1,1,1,'',48,23,75,'gravel',30,'Entrée directe'),
('T-126','Terrain 126','RV',6,52.00,1,1,1,1,1,'',30,20,70,'gravel',30,'Entrée directe'),
('T-127','Terrain 127','RV',6,49.00,1,1,0,1,1,'',35,18,40,'sable',30,'Communique 102'),
('T-128','Terrain 128','RV',6,49.00,1,1,0,1,1,'',48,19,20,'gravel+sable',30,'Communique 130'),
('T-129','Terrain 129','RV',6,49.00,1,1,0,1,1,'',30,18,70,'gravel',30,NULL),
('T-130','Terrain 130','RV',6,49.00,1,1,0,1,1,'',40,23,20,'sable',30,'Communique 128'),
('T-131','Terrain 131','RV',6,49.00,1,1,0,1,1,'',35,18,90,'gravel+gazon',30,NULL),
('T-132','Terrain 132','RV',6,49.00,1,1,0,1,1,'',35,27,60,'gravel+sable',30,NULL),
('T-133','Terrain 133','RV',6,49.00,1,1,0,1,1,'',40,20,90,'gravel',30,'Recule bien'),
('T-134','Terrain 134','RV',6,49.00,1,1,0,1,1,'',37,23,20,'sable',30,'Coin de rue, boisé'),
('T-135','Terrain 135','RV',6,49.00,1,1,0,1,1,'',45,20,90,'gravel+gazon',30,'Recule bien'),
('T-136','Terrain 136','TENT',6,43.00,0,0,0,1,1,'',39,19,20,'sable',0,'Communique 137'),
('T-137','Terrain 137','TENT',6,43.00,0,0,0,1,1,'',39,22,20,'sable',0,'Communique 136'),
('T-138','Terrain 138','TENT',6,43.00,0,0,0,1,1,'',42,20,20,'sable',0,'Forêt derrière'),
('T-139','Terrain 139','TENT',6,43.00,0,0,0,1,1,'',35,17,20,'sable',0,'Forêt derrière'),
('T-140','Terrain 140','TENT',6,43.00,0,0,0,1,1,'',49,17,10,'sable',0,'Forêt derrière'),
('T-141','Terrain 141','TENT',6,43.00,0,0,0,1,1,'',35,20,20,'sable',0,'Forêt derrière'),
('T-142','Terrain 142','TENT',6,43.00,0,0,0,1,1,'',35,16,10,'sable',0,'Forêt derrière'),
('T-143','Terrain 143','TENT',6,43.00,0,0,0,1,1,'',38,22,20,'sable',0,'Communique 144-145'),
('T-144','Terrain 144','TENT',6,43.00,0,0,0,1,1,'',30,20,20,'sable',0,'Communique 143-145'),
('T-145','Terrain 145','RV',6,49.00,1,1,0,1,1,'',40,20,25,'sable',30,'Communique 144-143'),
('T-146','Terrain 146','RV',6,49.00,1,1,0,1,1,'',42,30,15,'sable',30,'Forêt derrière'),
('T-147','Terrain 147','RV',6,49.00,1,1,0,1,1,'',43,17,15,'sable',30,'Forêt derrière'),
('T-148','Terrain 148','RV',6,52.00,1,1,1,1,1,'',33,20,50,'sable',30,'Forêt derrière'),
('T-149','Terrain 149','RV',6,52.00,1,1,1,1,1,'',45,24,50,'gravel',30,'Entrée directe'),
('T-150','Terrain 150','RV',6,52.00,1,1,1,1,1,'',37,22,40,'gravel+sable',30,'Difficile à reculer'),
('T-151','Terrain 151','RV',6,52.00,1,1,1,1,1,'',32,20,40,'gravel+sable',30,'Difficile à reculer'),
('T-152','Terrain 152','RV',6,52.00,1,1,1,1,1,'',30,18,40,'gravel+sable',30,'Difficile à reculer'),
('T-153','Terrain 153','RV',6,52.00,1,1,1,1,1,'',30,18,40,'gravel+sable',30,'Difficile à reculer'),
('T-154','Terrain 154','RV',6,52.00,1,1,1,1,1,'',30,15,40,'gravel+sable',30,'Difficile à reculer'),
('T-155','Terrain 155','RV',6,52.00,1,1,1,1,1,'',38,22,30,'gravel+sable',30,'Difficile à reculer'),
('T-156','Terrain 156','RV',6,52.00,1,1,1,1,1,'',35,19,30,'gravel+sable',30,'Difficile à reculer'),
('T-157','Terrain 157','RV',6,52.00,1,1,1,1,1,'',32,20,40,'gravel+sable',30,'Difficile à reculer'),
('T-158','Terrain 158','RV',6,52.00,1,1,1,1,1,'',34,18,80,'gravel+sable',30,'Pas intime'),
('T-300','Terrain 300','TENT',6,43.00,0,0,0,1,1,'',31,18,20,'sable',0,'Forêt derrière'),
('T-301','Terrain 301','TENT',6,43.00,0,0,0,1,1,'',31,21,20,'sable',0,'Forêt derrière'),
('T-302','Terrain 302','TENT',6,43.00,0,0,0,1,1,'',30,20,20,'sable',0,'Forêt derrière'),
('T-303','Terrain 303','TENT',6,43.00,0,0,0,1,1,'',29,19,30,'sable',0,'Forêt derrière'),
('T-304','Terrain 304','TENT',6,43.00,0,0,0,1,1,'',37,25,40,'sable',0,'Forêt derrière'),
('T-305','Terrain 305','TENT',6,43.00,0,0,0,1,1,'',26,23,40,'sable',0,'Forêt derrière'),
('T-306','Terrain 306','TENT',6,43.00,0,0,0,1,1,'',24,38,50,'sable',0,'Forêt derrière');
        "#,
        kind: MigrationKind::Up,
    },
    ];

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![save_temp_file])
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:camping-lajoie.db", migrations)
                .build(),
        )
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
