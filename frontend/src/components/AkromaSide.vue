<template>
  <nav class="nav">
    <el-menu :router="true" default-active="2" class="list">
      <el-menu-item class="noselect" index="/account">
        <el-icon>
          <Wallet />
        </el-icon>
        <!-- Accounts -->
      </el-menu-item>
      <el-menu-item class="noselect" index="/contacts">
        <el-icon>
          <Upload />
        </el-icon>
        <!-- Contacts -->
      </el-menu-item>
      <el-menu-item class="noselect" index="/settings">
        <el-icon>
          <Setting />
        </el-icon>
        <!-- Settings -->
      </el-menu-item>
    </el-menu>
  </nav>
</template>

<script lang="ts" setup></script>

<style scoped>
.nav {
  padding: 20px;
}
.list {
    border-radius: 5px;
  }
</style>
