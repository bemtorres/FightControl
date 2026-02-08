DO $$ 
DECLARE 
    v_user_id UUID;
    v_scen_cyber UUID;
    v_scen_fantasy UUID;
    v_scen_retro UUID;
BEGIN
    -- 1. Obtener el ID del primer usuario
    -- Salta 1 fila (la primera) y toma la siguiente (la segunda)
SELECT id INTO v_user_id FROM auth.users ORDER BY created_at ASC LIMIT 1 OFFSET 1;

    -- ==========================================
    -- ESCENARIO 1: DISTOPÍA CYBERPUNK (NEO-CITY)
    -- ==========================================
    INSERT INTO public.scenarios (user_id, name, chroma_key_color, background_url, font_family, settings)
    VALUES (v_user_id, 'NEO-CITY OVERDRIVE', '#00FFCC', 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?q=80&w=1920', 'font-russo', '{"is_public": true, "access_key": null}'::jsonb)
    RETURNING id INTO v_scen_cyber;

    INSERT INTO public.characters (scenario_id, name, description, icon_face, side_view_combat, victory_pose) VALUES 
    (v_scen_cyber, 'CYBER-VEMU', 'Cyborg de asalto pesado optimizado para combate urbano.', 'https://res.cloudinary.com/diytuytti/image/upload/v1770522901/game/Screenshot_20_zlkmmi.png', 'https://res.cloudinary.com/diytuytti/image/upload/v1770522902/game/Screenshot_21_b4jeff.png', 'https://res.cloudinary.com/diytuytti/image/upload/v1770522903/game/Screenshot_22_g1dtwg.png'),
    (v_scen_cyber, 'NEON STRIKER', 'Agente encubierta con extremidades de alta frecuencia.', 'https://res.cloudinary.com/diytuytti/image/upload/v1770522898/game/Screenshot_10_tgy6ci.png', 'https://res.cloudinary.com/diytuytti/image/upload/v1770522900/game/Screenshot_13_bjmtqm.png', 'https://res.cloudinary.com/diytuytti/image/upload/v1770522899/game/Screenshot_12_iigefu.png'),
    (v_scen_cyber, 'GLITCH ALIEN', 'Entidad digital que se materializó en el mundo físico.', 'https://res.cloudinary.com/diytuytti/image/upload/v1770522898/game/Screenshot_7_abtgzz.png', 'https://res.cloudinary.com/diytuytti/image/upload/v1770522897/game/Screenshot_8_y0uujg.png', 'https://res.cloudinary.com/diytuytti/image/upload/v1770522898/game/Screenshot_9_i2eurh.png'),
    (v_scen_cyber, 'BATTLE-BEAR X', 'Unidad de demolición peluda creada en laboratorios secretos.', 'https://res.cloudinary.com/diytuytti/image/upload/v1770522053/game/Screenshot_4_lbsl1q.png', 'https://res.cloudinary.com/diytuytti/image/upload/v1770522055/game/Screenshot_5_nozqg3.png', 'https://res.cloudinary.com/diytuytti/image/upload/v1770522054/game/Screenshot_6_lp8isk.png'),
    (v_scen_cyber, 'MECHA-ZUMO', 'Exoesqueleto hidráulico diseñado para aplastar revueltas.', 'https://res.cloudinary.com/diytuytti/image/upload/v1770522054/game/Screenshot_1_bititz.png', 'https://res.cloudinary.com/diytuytti/image/upload/v1770522054/game/Screenshot_2_qtrork.png', 'https://res.cloudinary.com/diytuytti/image/upload/v1770522054/game/Screenshot_3_g41b9s.png'),
    (v_scen_cyber, 'CODE BREAKER', 'Maestro del combate cercano y desencriptación forzada.', 'https://res.cloudinary.com/diytuytti/image/upload/v1770524067/game/Screenshot_30_mcqv27.png', 'https://res.cloudinary.com/diytuytti/image/upload/v1770524067/game/Screenshot_31_r4vzze.png', 'https://res.cloudinary.com/diytuytti/image/upload/v1770524067/game/Screenshot_32_yql06r.png');

    -- ==========================================
    -- ESCENARIO 2: TIERRAS SALVAJES (DARK FANTASY)
    -- ==========================================
    INSERT INTO public.scenarios (user_id, name, chroma_key_color, background_url, font_family, settings)
    VALUES (v_user_id, 'FORBIDDEN WILDLANDS', '#4A5D23', 'https://images.unsplash.com/photo-1500622397572-586969551139?q=80&w=1920', 'font-russo', '{"is_public": false, "access_key": "123456"}'::jsonb)
    RETURNING id INTO v_scen_fantasy;

    INSERT INTO public.characters (scenario_id, name, description, icon_face, side_view_combat, victory_pose) VALUES 
    (v_scen_fantasy, 'KORTHAR EL ROJO', 'Bárbaro legendario que forjó su hacha en lava.', 'https://res.cloudinary.com/diytuytti/image/upload/v1770522901/game/Screenshot_20_zlkmmi.png', 'https://res.cloudinary.com/diytuytti/image/upload/v1770522902/game/Screenshot_21_b4jeff.png', 'https://res.cloudinary.com/diytuytti/image/upload/v1770522903/game/Screenshot_22_g1dtwg.png'),
    (v_scen_fantasy, 'VALKYRIA DEL BOSQUE', 'Guerrera espiritual que protege los árboles ancestrales.', 'https://res.cloudinary.com/diytuytti/image/upload/v1770522898/game/Screenshot_10_tgy6ci.png', 'https://res.cloudinary.com/diytuytti/image/upload/v1770522900/game/Screenshot_13_bjmtqm.png', 'https://res.cloudinary.com/diytuytti/image/upload/v1770522899/game/Screenshot_12_iigefu.png'),
    (v_scen_fantasy, 'MORADOR DEL ABISMO', 'Criatura de las cuevas que nunca ha visto el sol.', 'https://res.cloudinary.com/diytuytti/image/upload/v1770522898/game/Screenshot_7_abtgzz.png', 'https://res.cloudinary.com/diytuytti/image/upload/v1770522897/game/Screenshot_8_y0uujg.png', 'https://res.cloudinary.com/diytuytti/image/upload/v1770522898/game/Screenshot_9_i2eurh.png'),
    (v_scen_fantasy, 'OSOMANIACO', 'Bestia del bosque con una fuerza bruta incontrolable.', 'https://res.cloudinary.com/diytuytti/image/upload/v1770522053/game/Screenshot_4_lbsl1q.png', 'https://res.cloudinary.com/diytuytti/image/upload/v1770522055/game/Screenshot_5_nozqg3.png', 'https://res.cloudinary.com/diytuytti/image/upload/v1770522054/game/Screenshot_6_lp8isk.png'),
    (v_scen_fantasy, 'EL COLOSO DE PIEDRA', 'Un gigante de las montañas con puños como rocas.', 'https://res.cloudinary.com/diytuytti/image/upload/v1770522054/game/Screenshot_1_bititz.png', 'https://res.cloudinary.com/diytuytti/image/upload/v1770522054/game/Screenshot_2_qtrork.png', 'https://res.cloudinary.com/diytuytti/image/upload/v1770522054/game/Screenshot_3_g41b9s.png'),
    (v_scen_fantasy, 'RONIN ERRANTE', 'Espadachín que busca redención en el campo de batalla.', 'https://res.cloudinary.com/diytuytti/image/upload/v1770524067/game/Screenshot_30_mcqv27.png', 'https://res.cloudinary.com/diytuytti/image/upload/v1770524067/game/Screenshot_31_r4vzze.png', 'https://res.cloudinary.com/diytuytti/image/upload/v1770524067/game/Screenshot_32_yql06r.png');

    -- ==========================================
    -- ESCENARIO 3: ARENA RETRO (PIXEL WORLD)
    -- ==========================================
    INSERT INTO public.scenarios (user_id, name, chroma_key_color, background_url, font_family, settings)
    VALUES (v_user_id, 'RETRO PIXEL ARENA', '#FF00FF', 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1920', 'font-press-start', '{"is_public": true, "access_key": null}'::jsonb)
    RETURNING id INTO v_scen_retro;

    INSERT INTO public.characters (scenario_id, name, description, icon_face, side_view_combat, victory_pose) VALUES 
    (v_scen_retro, 'FINAL BOSS VEMU', 'La última barrera antes de terminar el juego.', 'https://res.cloudinary.com/diytuytti/image/upload/v1770522901/game/Screenshot_20_zlkmmi.png', 'https://res.cloudinary.com/diytuytti/image/upload/v1770522902/game/Screenshot_21_b4jeff.png', 'https://res.cloudinary.com/diytuytti/image/upload/v1770522903/game/Screenshot_22_g1dtwg.png'),
    (v_scen_retro, 'ARCADE QUEEN', 'Campeona invicta de los salones recreativos de los 90.', 'https://res.cloudinary.com/diytuytti/image/upload/v1770522898/game/Screenshot_10_tgy6ci.png', 'https://res.cloudinary.com/diytuytti/image/upload/v1770522900/game/Screenshot_13_bjmtqm.png', 'https://res.cloudinary.com/diytuytti/image/upload/v1770522899/game/Screenshot_12_iigefu.png'),
    (v_scen_retro, 'SPACE INVADER', 'Pequeño alienígena con un gran deseo de conquista.', 'https://res.cloudinary.com/diytuytti/image/upload/v1770522898/game/Screenshot_7_abtgzz.png', 'https://res.cloudinary.com/diytuytti/image/upload/v1770522897/game/Screenshot_8_y0uujg.png', 'https://res.cloudinary.com/diytuytti/image/upload/v1770522898/game/Screenshot_9_i2eurh.png'),
    (v_scen_retro, 'PIXEL BEAR', 'Un oso de 8 bits con una fuerza de 16 bits.', 'https://res.cloudinary.com/diytuytti/image/upload/v1770522053/game/Screenshot_4_lbsl1q.png', 'https://res.cloudinary.com/diytuytti/image/upload/v1770522055/game/Screenshot_5_nozqg3.png', 'https://res.cloudinary.com/diytuytti/image/upload/v1770522054/game/Screenshot_6_lp8isk.png'),
    (v_scen_retro, 'ZUMO RETRO', 'Personaje secreto desbloqueable mediante un código.', 'https://res.cloudinary.com/diytuytti/image/upload/v1770522054/game/Screenshot_1_bititz.png', 'https://res.cloudinary.com/diytuytti/image/upload/v1770522054/game/Screenshot_2_qtrork.png', 'https://res.cloudinary.com/diytuytti/image/upload/v1770522054/game/Screenshot_3_g41b9s.png'),
    (v_scen_retro, 'MASTER BEM', 'El mentor que te enseña los controles básicos.', 'https://res.cloudinary.com/diytuytti/image/upload/v1770524067/game/Screenshot_30_mcqv27.png', 'https://res.cloudinary.com/diytuytti/image/upload/v1770524067/game/Screenshot_31_r4vzze.png', 'https://res.cloudinary.com/diytuytti/image/upload/v1770524067/game/Screenshot_32_yql06r.png');

    -- 3. Crear estados de juego iniciales
    INSERT INTO public.game_state (scenario_id) VALUES (v_scen_cyber), (v_scen_fantasy), (v_scen_retro);

END $$;