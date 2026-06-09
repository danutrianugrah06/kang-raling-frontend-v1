<template>
  <nav class="navbar">
    <!-- LOGO KANG RALING -->
    <div class="navbar-brand">
      <img src="../assets/icons/logoKangRaling.png" alt="Kang Raling" class="navbar-logo" />
    </div>

    <!-- MENU NAVIGASI -->
    <ul class="navbar-menu" :class="{ 'navbar-menu-open': menuOpen }">
      <li>
        <router-link to="/" @click="menuOpen = false">Beranda</router-link>
      </li>
      <li>
        <router-link to="/media" @click="menuOpen = false">Media</router-link>
      </li>
      <li>
        <router-link to="/desa-binaan" @click="menuOpen = false">Desa Binaan</router-link>
      </li>
      <li>
        <router-link to="/edukasi" @click="menuOpen = false">Edukasi</router-link>
      </li>
      <li>
        <router-link to="/data-sampah" @click="menuOpen = false">Data Sampah</router-link>
      </li>
      <li>
        <router-link to="/tentang-kami" @click="menuOpen = false">Tentang Kami</router-link>
      </li>

      <!-- LOGIN MOBILE -->
      <li class="navbar-mobile-login">
        <router-link to="/login" class="navbar-btn" @click="menuOpen = false">Masuk</router-link>
      </li>
    </ul>

    <!-- AKSI KANAN -->
    <div class="navbar-actions">
      <!-- LOGIN DESKTOP -->
      <router-link to="/login" class="navbar-btn navbar-desktop-login">Masuk</router-link>

      <!-- HAMBURGER MENU -->
      <button class="navbar-hamburger" @click="menuOpen = !menuOpen" aria-label="Toggle menu">
        <span></span>
        <span></span>
        <span></span>
      </button>
    </div>
  </nav>
</template>

<script setup>
import { ref } from 'vue'
import '../assets/css/navbar.css'

/* STATE MOBILE MENU */
const menuOpen = ref(false)
</script>