#!/usr/bin/env node

/**
 * Скрипт для проверки статуса бота на Render
 */

const axios = require('axios');

const RENDER_URL = 'https://botenergy-7to1.onrender.com';

async function checkStatus() {
    console.log('🔍 Проверяем статус бота на Render...\n');
    
    try {
        // Проверяем health check
        console.log('1. Проверяем health check...');
        const healthResponse = await axios.get(`${RENDER_URL}/health`);
        console.log('✅ Health check:', healthResponse.data);
    } catch (error) {
        console.log('❌ Health check failed:', error.message);
    }
    
    try {
        // Проверяем API изображений
        console.log('\n2. Проверяем API изображений...');
        const imagesResponse = await axios.get(`${RENDER_URL}/api/images`);
        console.log('✅ API изображений работает');
        console.log('📸 Количество изображений:', Object.keys(imagesResponse.data).length);
    } catch (error) {
        console.log('❌ API изображений failed:', error.message);
    }
    
    try {
        // Проверяем главную страницу
        console.log('\n3. Проверяем главную страницу...');
        const mainResponse = await axios.get(`${RENDER_URL}/`);
        console.log('✅ Главная страница работает');
        console.log('📄 Статус:', mainResponse.data.status);
    } catch (error) {
        console.log('❌ Главная страница failed:', error.message);
    }
    
    console.log('\n🎯 Если все проверки прошли успешно, бот работает корректно!');
}

checkStatus().catch(console.error);
