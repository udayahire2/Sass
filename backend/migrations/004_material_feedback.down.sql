-- Rollback: Remove material_feedback table

DROP INDEX IF EXISTS idx_material_feedback_reviewer_id;
DROP INDEX IF EXISTS idx_material_feedback_material_id;
DROP TABLE IF EXISTS material_feedback;
