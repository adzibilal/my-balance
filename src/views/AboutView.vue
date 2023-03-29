<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../lib/supabaseClient'

const transactions = ref([])
const balance = ref([])
const income = ref(0)
const expense = ref(0)
const isAdd = ref(false)

const valAmount = ref(0)
const valType = ref('income')

async function getTransactions() {
  const { data } = await supabase.from('transactions').select().order('date', { ascending: false })
  transactions.value = data

  if (income.value != 0 || expense.value != 0) {
    income.value = 0
    expense.value = 0
  }

  transactions.value.forEach((transaction) => {
    if (transaction.type === 'income') {
      income.value += transaction.amount
    } else {
      expense.value += transaction.amount
    }
  })
}
async function getBalance() {
  const { data } = await supabase.from('balance').select()
  balance.value = data
  console.error(balance.value)
}

function getStat() {}

function formatRupiah(angka) {
  let rupiah = ''
  const angkaString = angka.toString()
  const sisaAngka = angkaString.length % 3

  if (angkaString.length > 3) {
    for (let i = 0; i < angkaString.length; i++) {
      if (i == sisaAngka && sisaAngka != 0) rupiah += '.'
      if (i % 3 == sisaAngka && i != 0 && sisaAngka == 0) rupiah += '.'
      rupiah += angkaString[i]
    }
  } else {
    rupiah = angkaString
  }

  return `Rp ${rupiah},00`
}

function formatDateTime(dateTimeString) {
  const months = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember'
  ]

  const [datePart, timePart] = dateTimeString.split('T')
  const [year, month, day] = datePart.split('-')
  const [hour, minute] = timePart.split(':')

  const formattedDate = `${parseInt(day, 10)} ${months[parseInt(month, 10) - 1]} ${year}`
  const formattedTime = `Pukul ${hour}:${minute}`

  return `${formattedDate}, ${formattedTime}`
}

async function addTransaction() {
  const now = Date.now()
  const dateObj = new Date(now)
  const year = dateObj.getFullYear()
  const month = ('0' + (dateObj.getMonth() + 1)).slice(-2)
  const date = ('0' + dateObj.getDate()).slice(-2)
  const hours = ('0' + dateObj.getHours()).slice(-2)
  const minutes = ('0' + dateObj.getMinutes()).slice(-2)
  const seconds = ('0' + dateObj.getSeconds()).slice(-2)

  const formattedTime = `${year}-${month}-${date}T${hours}:${minutes}:${seconds}`
  // console.error(formattedTime)

  const { error } = await supabase
    .from('transactions')
    .insert({ type: valType.value, amount: valAmount.value, date: formattedTime })

  if (error) {
    console.error('addTransaction', error)
  } else {
    valAmount.value = 0
    getTransactions()
    getBalance()
    isAdd.value = false
  }
}

async function deleteTransaction(id) {
  if (confirm('Yakin Ingin Menghapus?') == true) {
    const { error } = await supabase.from('transactions').delete().eq('id', id)

    if (error) {
      console.error('deleteTransaction', error)
    } else {
      getTransactions()
      getBalance()
      console.error(id)
    }
  }
}
onMounted(() => {
  getTransactions()
  getBalance()
  getStat()
  // addTransaction()
})
</script>

<template>
  <div class="transaction-contianer">
    <div>
      <p>Balance</p>
      <div class="statistik balance text-green" v-for="(item, index) in balance" :key="index">
        {{ formatRupiah(item.balance) }}
      </div>
    </div>
    <div class="grid-statistik">
      <div>
        <p>Pemasukan</p>
        <div class="statistik text-green">
          {{ formatRupiah(income) }}
        </div>
      </div>
      <div>
        <p>Pengeluaran</p>
        <div class="statistik text-red">
          {{ formatRupiah(expense) }}
        </div>
      </div>
    </div>
    <br />
    <div class="btn-transaction" @click="isAdd = true">Transaksi Baru</div>
    <div class="scroller-transaction">
      <div v-for="transaction in transactions" :key="transaction.id" class="item-transaction">
        <div
          class="amount"
          :class="{
            'text-green': transaction.type === 'income',
            'text-red': transaction.type === 'expense'
          }"
        >
          {{ formatRupiah(transaction.amount) }}
        </div>
        <div
          class="type"
          :class="{
            'text-green': transaction.type === 'income',
            'text-red': transaction.type === 'expense'
          }"
        >
          {{ transaction.type }}
        </div>
        <div class="date">{{ formatDateTime(transaction.date) }}</div>
        <div class="description">{{ transaction.description }}</div>
        <div class="delete" @click="deleteTransaction(transaction.id)">x</div>
      </div>
    </div>
    <div class="black-overlay" v-if="isAdd" @click="isAdd = false"></div>
    <div class="modal-add" v-if="isAdd">
      <p>Type</p>
      <input type="text" v-model="valType" />
      <p>Amount</p>
      <input type="text" name="" id="" v-model="valAmount" />
      <div class="btn-transaction" @click="addTransaction">Tambah</div>
    </div>
  </div>
</template>
