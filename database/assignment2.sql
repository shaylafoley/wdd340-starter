-- Insert Tony Stark into account
INSERT INTO account (
        account_firstname,
        account_lastname,
        account_email,
        account_password
    )
VALUES (
        'Tony',
        'Stark',
        'tony@starkent.com',
        'Iam1ronM@n'
    );

-- Update Tony's account to say 'Admin'
UPDATE account
SET account_type = 'Admin'
WHERE account_email = 'tony@starkent.com';

-- Delete Tony's account
DELETE FROM account
WHERE account_email = 'tony@starkent.com';

-- Change inventory description on GM Hummer
UPDATE inventory
SET inv_description = REPLACE(
        inv_description,
        'the small interiors',
        'a huge interior'
    )
WHERE inv_make = 'GM'
    AND inv_model = 'Hummer';

-- Inner join for inventory and classification tables
SElECT i.inv_make,
    i.inv_model,
    c.classification_name
FROM inventory i
    INNER JOIN classification c ON i.classification_id = c.classification_id
WHERE c.classification_name = 'Sport';

-- Update inventory images and thumbnails
UPDATE inventory
SET inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/'),
    inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/');