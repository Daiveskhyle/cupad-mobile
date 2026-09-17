import { useCallback,useEffect,useState } from 'react';
import { ActivityIndicator,Alert,KeyboardAvoidingView,Platform,Pressable,RefreshControl,ScrollView,StyleSheet,Text,TextInput,View } from 'react-native';
import DateTimePicker,{DateTimePickerEvent} from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useAuthStore } from '../../src/store/auth';
import { useThemeStore } from '../../src/store/theme';
import { api } from '../../src/api/client';
import type { Client } from '../../src/types';

const money=(v:any)=>`₦${Number(v||0).toLocaleString('en-NG',{maximumFractionDigits:0})}`;
