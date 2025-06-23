import { Image } from 'expo-image';
import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';

export default function NotFoundScreen() {
  const { width } = useWindowDimensions();
  const imgSrc = 'https://cdn.dribbble.com/users/285475/screenshots/2083086/dribbble_1.gif';
  const imgSize = width > 500 ? 320 : width * 0.7;
  const fontBig = width > 500 ? 80 : width * 0.16;
  const fontH2 = width > 500 ? 28 : width * 0.06;

  return (
    <View style={styles.page_404}>
      <Stack.Screen options={{ title: '404 - Não encontrado' }} />
      <View style={styles.four_zero_four_bg}>
        <Text style={[styles.h1, { fontSize: fontBig }]}>404</Text>
        <Image
          source={imgSrc}
          style={[styles.bgImg, { width: imgSize, height: imgSize * 0.56 }]}
          contentFit="contain"
        />
      </View>
      <View style={styles.contant_box_404}>
        <Text style={[styles.h2, { fontSize: fontH2 }]}>Parece que você se perdeu</Text>
        <Text style={styles.p}>A página que você procura não existe!</Text>
        <Link href="/" asChild>
          <TouchableOpacity style={styles.link_404}>
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Ir para o início</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page_404: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  four_zero_four_bg: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  h1: {
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
    marginBottom: 16,
    marginTop: 0,
  },
  bgImg: {
    marginBottom: 0,
  },
  contant_box_404: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 0,
  },
  h2: {
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 12,
    textAlign: 'center',
  },
  p: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
    textAlign: 'center',
  },
  link_404: {
    backgroundColor: '#39ac31',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 6,
    marginTop: 10,
  },
});
