-- Create geometry views for QGIS integration
-- These views convert JSON coordinates to PostGIS geometries

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- View for project locations (points)
CREATE OR REPLACE VIEW projects_roadproject_points AS
SELECT 
    id,
    name,
    description,
    status,
    priority,
    budget,
    start_date,
    end_date,
    created_at,
    updated_at,
    created_by_id,
    polyline_color,
    ST_SetSRID(ST_MakePoint(longitude, latitude), 4326) AS geom
FROM projects_roadproject 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- View for project polylines (linestrings)
CREATE OR REPLACE VIEW projects_roadproject_polylines AS
SELECT 
    id,
    name,
    description,
    status,
    priority,
    budget,
    start_date,
    end_date,
    created_at,
    updated_at,
    created_by_id,
    polyline_color,
    ST_SetSRID(
        ST_MakeLine(
            ARRAY(
                SELECT ST_MakePoint(
                    (coord->>1)::float,  -- longitude
                    (coord->>0)::float   -- latitude
                )
                FROM json_array_elements(polyline_coordinates) AS coord
            )
        ), 
        4326
    ) AS geom
FROM projects_roadproject 
WHERE polyline_coordinates IS NOT NULL 
AND json_array_length(polyline_coordinates) >= 2;

-- View for photo locations (points)
CREATE OR REPLACE VIEW projects_projectphoto_points AS
SELECT 
    id,
    title,
    description,
    taken_at,
    project_id,
    uploaded_by_id,
    ST_SetSRID(ST_MakePoint(longitude, latitude), 4326) AS geom
FROM projects_projectphoto 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_roadproject_points_geom 
ON projects_roadproject_points USING GIST (geom);

CREATE INDEX IF NOT EXISTS idx_roadproject_polylines_geom 
ON projects_roadproject_polylines USING GIST (geom);

CREATE INDEX IF NOT EXISTS idx_projectphoto_points_geom 
ON projects_projectphoto_points USING GIST (geom);

-- Grant permissions
GRANT SELECT ON projects_roadproject_points TO postgres;
GRANT SELECT ON projects_roadproject_polylines TO postgres;
GRANT SELECT ON projects_projectphoto_points TO postgres;